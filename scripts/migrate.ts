import { createClient, type Client } from "@libsql/client";
import * as fs from "node:fs";
import * as path from "node:path";

const MIGRATIONS_FOLDER = "./drizzle";

// The 'when' timestamp of the last migration applied via db:push (0004_ancient_gorilla_man).
// Seeding __drizzle_migrations with this value tells the runner that everything up to
// migration 0004 is already in place, so only newer migrations are applied.
const LAST_PUSHED_MIGRATION_TIMESTAMP = 1777878243232;

interface JournalEntry {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints: boolean;
}

interface Journal {
  version: string;
  dialect: string;
  entries: JournalEntry[];
}

// Errors raised by libsql/SQLite when a DDL targets an object whose state already
// matches the post-migration shape — typically because someone ran db:push and the
// migration is now redundant. These are the only failures we treat as a silent
// "skip and record" instead of aborting CI.
const SCHEMA_DRIFT_ERROR_PATTERNS = [
  /no such index/i,
  /no such column/i,
  /no such table/i,
  /duplicate column name/i,
  /(table|index|column) .* already exists/i,
];

function isSchemaDriftError(message: string): boolean {
  return SCHEMA_DRIFT_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

function readJournal(): Journal {
  const journalPath = path.join(MIGRATIONS_FOLDER, "meta", "_journal.json");
  return JSON.parse(fs.readFileSync(journalPath, "utf8")) as Journal;
}

function readMigrationStatements(tag: string): string[] {
  const sqlPath = path.join(MIGRATIONS_FOLDER, `${tag}.sql`);
  return fs
    .readFileSync(sqlPath, "utf8")
    .split("--> statement-breakpoint")
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0);
}

async function recordApplied(client: Client, hash: string, when: number) {
  await client.execute({
    sql: "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
    args: [hash, when],
  });
}

async function applyPendingMigrations(client: Client) {
  const journal = readJournal();
  const { rows } = await client.execute(
    "SELECT MAX(created_at) AS last FROM __drizzle_migrations",
  );
  const lastApplied = Number(rows[0][0] ?? 0);

  const pending = journal.entries
    .filter((entry) => entry.when > lastApplied)
    .sort((a, b) => a.when - b.when);

  for (const entry of pending) {
    const statements = readMigrationStatements(entry.tag);
    let executed = 0;
    let driftMessage: string | null = null;

    for (const stmt of statements) {
      try {
        await client.execute(stmt);
        executed += 1;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // Only tolerate drift on the very first statement. If we've already
        // mutated the schema, a later drift error means something genuinely
        // unexpected happened and we should fail loudly.
        if (executed === 0 && isSchemaDriftError(message)) {
          driftMessage = message;
          break;
        }
        throw err;
      }
    }

    if (driftMessage) {
      await recordApplied(client, `skipped-${entry.tag}`, entry.when);
      console.log(
        `Skipped migration ${entry.tag} — schema already at target state (likely db:push): ${driftMessage}`,
      );
    } else {
      await recordApplied(client, entry.tag, entry.when);
      console.log(`Applied migration ${entry.tag} (${executed} statements)`);
    }
  }
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");

  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hash TEXT NOT NULL,
        created_at INTEGER
      )
    `);

    const { rows } = await client.execute(
      "SELECT COUNT(*) AS count FROM __drizzle_migrations",
    );
    const count = Number(rows[0][0]);

    if (count === 0) {
      await recordApplied(client, "bootstrapped-0004", LAST_PUSHED_MIGRATION_TIMESTAMP);
      console.log(
        "Migration tracking bootstrapped: migrations 0000-0004 marked as already applied",
      );
    }

    await applyPendingMigrations(client);
    console.log("Migrations applied successfully");
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
