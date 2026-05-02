# Contributing

## Local development

```bash
bun install
bun run db:push   # apply schema (local file DB unless you point env at Turso)
bun run dev       # http://localhost:3000
```

Configure the [environment variables](#environment-variables) below for auth, Stripe, and a remote database. Without `TURSO_DATABASE_URL` the app uses a local SQLite file; some routes behave differently when the database is empty.

```bash
bun run build       # production build
bun run typecheck   # TypeScript
bun run lint        # ESLint
bun run format      # Prettier
bun run db:studio   # Drizzle Studio
```

## Environment variables

| Variable                | Description                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| `TURSO_DATABASE_URL`    | Turso database URL (`libsql://...`). Omit to use local `file:./digest.db`.      |
| `TURSO_AUTH_TOKEN`      | Turso auth token (required when using a remote Turso URL).                      |
| `OPENROUTER_API_KEY`    | OpenRouter API key (used by the Jazz workflows in CI).                          |
| `PARALLEL_API_KEY`      | Parallel web search API key (configured in the daily digest workflow for Jazz). |
| `AUTH_SECRET`           | Secret for NextAuth session signing (generate a random string in production).   |
| `AUTH_URL`              | Canonical site URL for auth callbacks (e.g. `http://localhost:3000` in dev).    |
| `AUTH_RESEND_KEY`       | Resend API key for magic-link email.                                            |
| `STRIPE_SECRET_KEY`     | Stripe secret key for checkout and customer portal.                             |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the Stripe webhook endpoint.                                 |
| `STRIPE_PRICE_ID`       | Price ID for the archive subscription product.                                  |
| `NEXT_PUBLIC_BASE_URL`  | Public site URL for metadata, Stripe redirects, and OG canonical URLs.          |

GitHub Actions secrets for the scheduled digest should include at least `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `OPENROUTER_API_KEY`, and `PARALLEL_API_KEY` to match `.github/workflows/daily-digest.yml`.
