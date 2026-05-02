# The Dollar Digest

AI-curated daily news digest — tech and politics, every morning, for $1/month.

Every day at 07:00 UTC a GitHub Action fetches RSS feeds across the political spectrum and tech press, calls an LLM to select and summarise the most important stories, extracts article images, and writes them to a hosted SQLite database. The Next.js frontend renders them as an editorial newspaper.

## Stack

| Layer    | Technology                                                           |
| -------- | -------------------------------------------------------------------- |
| Frontend | Next.js 15 App Router, Tailwind CSS v4, `next/image`, `next/og`      |
| Database | [Turso](https://turso.tech) (LibSQL) + Drizzle ORM                   |
| AI       | `deepseek/deepseek-v4-flash` via [OpenRouter](https://openrouter.ai) |
| Pipeline | GitHub Actions (daily cron, two parallel jobs)                       |
| Runtime  | Bun                                                                  |

## How it works

1. **RSS fetch** — multiple feeds per category are polled; items from the last 26 hours are collected.
2. **LLM selection** — DeepSeek picks the 6–10 most important stories, writes neutral headlines and 2–3 sentence summaries, scores importance, and labels source bias (politics) or subcategory (tech).
3. **Image extraction** — article pages are streamed (first ~12 KB only) to extract `og:image` / `twitter:image` with bounded concurrency.
4. **DB write** — rows are inserted into Turso via Drizzle ORM.
5. **Frontend** — Next.js reads today's articles server-side and renders a 12-column editorial grid with per-article detail pages and dynamic OG images.

## Categories

**Tech** — AI · VC · Research · Startup · Product · Security

**Politics** — source bias labels: Far Left · Left-Leaning · Center · Right-Leaning · Far Right

## Development

```bash
bun install

# local SQLite (no Turso needed)
bun run db:push
bun run dev       # http://localhost:3000
```

For production, set the environment variables below and run `bun run db:push` once to initialise the remote schema.

## Environment variables

| Variable             | Description                         |
| -------------------- | ----------------------------------- |
| `TURSO_DATABASE_URL` | Turso database URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN`   | Turso auth token                    |
| `OPENROUTER_API_KEY` | OpenRouter API key                  |

Without `TURSO_DATABASE_URL` the app falls back to a local `digest.db` file. The frontend falls back to mock data if the database is unavailable.

## GitHub Actions

The pipeline runs automatically via `.github/workflows/daily-digest.yml`.

| Job              | Cron (UTC)  | Feeds                                                    |
| ---------------- | ----------- | -------------------------------------------------------- |
| `tech-news`      | 07:00 daily | The Verge, TechCrunch, Ars Technica, Wired, Hacker News  |
| `political-news` | 07:30 daily | AP, Reuters, BBC, Guardian, Fox News, Politico, The Hill |

Trigger manually from the Actions tab using `workflow_dispatch` (choose `both`, `tech`, or `politics`).

## Commands

```bash
bun run dev            # development server
bun run build          # production build
bun run typecheck      # tsc --noEmit
bun run lint           # ESLint
bun run format         # Prettier
bun run db:push        # sync schema to database
bun run db:studio      # Drizzle Studio GUI
```
