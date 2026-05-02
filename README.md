# The Dollar Digest

AI-curated daily news for $1/month.

## Stack

- **Frontend**: Next.js 15 (App Router) — editorial newspaper aesthetic
- **DB**: SQLite via Drizzle ORM
- **Workflows**: Jazz CLI — runs daily at 7 AM (tech) and 7:30 AM (politics)
- **Models**: `deepseek/deepseek-v4-flash` via OpenRouter

## Workflows

| Workflow         | Schedule    | Description                                              |
| ---------------- | ----------- | -------------------------------------------------------- |
| `tech-news`      | 07:00 daily | AI, VC, Research, Startup, Product, Security             |
| `political-news` | 07:30 daily | Politics with source bias labels (left / center / right) |

Run manually:

```bash
jazz workflow run tech-news
jazz workflow run political-news
```

## Development

```bash
bun install
bun run db:push   # initialise SQLite schema
bun run dev       # http://localhost:3000
```

## DB schema

Articles table: `id`, `title`, `summary`, `source`, `source_url`, `category` (tech|politics), `subcategory`, `bias`, `published_at`, `reading_time_minutes`, `importance_score`, `digest_date`, `created_at`.
