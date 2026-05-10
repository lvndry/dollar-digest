import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const MIGRATIONS_FOLDER = "./drizzle";

// The 'when' timestamp of the last migration applied via db:push (0004_ancient_gorilla_man).
// Seeding __drizzle_migrations with this value tells drizzle-orm that everything up to
// migration 0004 is already in place, so only newer migrations are applied.
const LAST_PUSHED_MIGRATION_TIMESTAMP = 1777878243232;

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");

  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  try {
    const db = drizzle(client);

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
      await client.execute({
        sql: "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
        args: ["bootstrapped-0004", LAST_PUSHED_MIGRATION_TIMESTAMP],
      });
      console.log(
        "Migration tracking bootstrapped: migrations 0000-0004 marked as already applied",
      );
    }

    // Migration 0006 drops the articles_source_url_digest_date_unique index and the
    // source_url column. Both were already removed via db:push before migration-based
    // deploys were introduced, so we pre-mark 0006 as applied when the index is absent.
    const MIGRATION_0006_TIMESTAMP = 1778395331549;
    const { rows: alreadySeeded } = await client.execute({
      sql: "SELECT COUNT(*) AS count FROM __drizzle_migrations WHERE created_at >= ?",
      args: [MIGRATION_0006_TIMESTAMP],
    });
    if (Number(alreadySeeded[0][0]) === 0) {
      const { rows: indexRows } = await client.execute(
        "SELECT COUNT(*) AS count FROM sqlite_master WHERE type='index' AND name='articles_source_url_digest_date_unique'",
      );
      if (Number(indexRows[0][0]) === 0) {
        await client.execute({
          sql: "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
          args: ["bootstrapped-0006", MIGRATION_0006_TIMESTAMP],
        });
        console.log(
          "Migration 0006 bootstrapped: index already absent, marking as applied",
        );
      }
    }

    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    console.log("Migrations applied successfully");
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
