# one-dollar-digest

## Database migrations

Schema changes require a matching migration file committed in the same PR.

1. Edit `src/lib/schema.ts`
2. Run `bun run db:generate` to produce the SQL migration + snapshot
3. Commit `schema.ts`, the new `drizzle/XXXX_*.sql`, and the updated `drizzle/meta/` files together

CI enforces this: it runs `db:generate` and fails if any new or modified files appear in `drizzle/`.

Do **not** run `db:generate` in CI — it is a local / pre-commit step only.
CI runs `db:migrate` (`scripts/migrate.ts`) to apply committed migrations to the Turso database.
