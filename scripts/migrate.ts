import { createClient, type Client } from "@libsql/client";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

const MIGRATIONS_FOLDER = "./drizzle";

// The tag of the last migration applied via db:push (0004_ancient_gorilla_man).
// Seeding __drizzle_migrations with rows for 0000-0004 tells the runner that
// everything up to that migration is already in place.
const LAST_PUSHED_MIGRATION_TAG = "0004_ancient_gorilla_man";

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

function readMigrationSql(tag: string): string {
  const sqlPath = path.join(MIGRATIONS_FOLDER, `${tag}.sql`);
  return fs.readFileSync(sqlPath, "utf8");
}

function readMigrationStatements(tag: string): string[] {
  return readMigrationSql(tag)
    .split("--> statement-breakpoint")
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0);
}

// drizzle-kit records each migration in `__drizzle_migrations` as the SHA256
// of the migration file's full SQL content. Matching that format keeps this
// table interoperable with `drizzle-kit migrate` if we ever switch back to it.
function migrationHash(tag: string): string {
  return createHash("sha256").update(readMigrationSql(tag)).digest("hex");
}

async function bootstrapMigrationTable(client: Client) {
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
  if (Number(rows[0][0]) > 0) return;

  const journal = readJournal();
  const lastPushedIdx = journal.entries.findIndex(
    (entry) => entry.tag === LAST_PUSHED_MIGRATION_TAG,
  );
  if (lastPushedIdx === -1) {
    throw new Error(
      `Bootstrap migration tag "${LAST_PUSHED_MIGRATION_TAG}" not found in journal`,
    );
  }

  const seeded = journal.entries.slice(0, lastPushedIdx + 1);
  const tx = await client.transaction("write");
  try {
    for (const entry of seeded) {
      await tx.execute({
        sql: "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
        args: [migrationHash(entry.tag), entry.when],
      });
    }
    await tx.commit();
  } finally {
    // close() rolls back if commit() never ran, and is a no-op otherwise.
    tx.close();
  }

  console.log(
    `Migration tracking bootstrapped: ${seeded.length} migrations recorded with SHA256 hashes (up to ${LAST_PUSHED_MIGRATION_TAG})`,
  );
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
    const hash = migrationHash(entry.tag);
    const tx = await client.transaction("write");
    let driftMessage: string | null = null;
    let executed = 0;

    try {
      for (const stmt of statements) {
        try {
          await tx.execute(stmt);
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

      await tx.execute({
        sql: "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
        args: [hash, entry.when],
      });
      await tx.commit();
    } finally {
      // close() rolls back if commit() never ran, and is a no-op otherwise.
      tx.close();
    }

    if (driftMessage) {
      console.log(
        `Recorded migration ${entry.tag} as already-applied — schema already at target state (likely db:push): ${driftMessage}`,
      );
    } else {
      console.log(`Applied migration ${entry.tag} (${executed} statements)`);
    }
  }
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");

  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  try {
    await bootstrapMigrationTable(client);
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
