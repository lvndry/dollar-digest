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
