# Search Feature Design

**Date:** 2026-05-05
**Status:** Approved

## Overview

A subscriber-only `/search` page that lets users query the full article archive using structured filters (date, topic, tags) and optional free-text search across titles and summaries. Visual filter panels and a typed query bar stay in sync via URL params. Results use the existing article card grid with server-side pagination.

## Access Control

`/search` requires archive access. The Server Component calls `canAccessArchive(session)` — the same guard used by the archive — and redirects to `/login?callbackUrl=/search` if the check fails. No new access logic is introduced.

## URL Structure

Named URL params drive all state:

```
/search?topic=politics&tags=AI,VC&date=2026-04-10&text=inflation&page=2
```

All params are optional. Omitting a param means "no filter on that field."

## Query Syntax (typed query bar)

The query bar reconstructs params into a readable string and parses it back on submit:

| Token                                  | Example           | Param                  |
| -------------------------------------- | ----------------- | ---------------------- |
| `date:MM-DD-YYYY` or `date:YYYY-MM-DD` | `date:04-10-2026` | `date=2026-04-10`      |
| `topic:tech` or `topic:politics`       | `topic:politics`  | `topic=politics`       |
| `tags:A,B` or `tags:A or B`            | `tags:VC,AI`      | `tags=VC,AI`           |
| bare words                             | `Federal Reserve` | `text=Federal+Reserve` |

## Data Layer

**`src/lib/search.ts`** owns all query logic.

```ts
type SearchFilters = {
  text?: string;
  date?: string; // YYYY-MM-DD
  topic?: "tech" | "politics";
  tags?: string[]; // OR logic
  page: number;
};

type SearchResult = {
  articles: Article[];
  total: number;
  pages: number;
};
```

`searchArticles(filters: SearchFilters): Promise<SearchResult>` builds a dynamic Drizzle `and()` clause:

- **date** → `eq(articles.digestDate, date)`
- **topic** → `eq(articles.category, topic)`
- **tags** → `or(...tags.map(tag => like(articles.tags, '%"TAG"%')))` — matches JSON-stringified arrays
- **text** → `or(like(articles.title, '%term%'), like(articles.summary, '%term%'))`

Pagination: `LIMIT 20 OFFSET (page-1)*20`. Total count from a separate `count()` query. The function has no auth logic — callers confirm access before invoking it.

## Components

### `src/app/search/page.tsx` (Server Component)

Reads `searchParams`, verifies access, calls `searchArticles()`, renders:

1. `<SearchFilters>` — the Client Component for filter UI
2. Article card grid (reuses existing grid component)
3. `<SearchPagination>` — page navigation

### `src/components/search-filters.tsx` (Client Component)

Two surfaces that stay in sync:

- **Visual panels**: date input, topic dropdown (All / Tech / Politics), tags comma-separated input. Each change calls `router.push()` with updated params.
- **Query bar**: single text input showing reconstructed syntax. On submit, parses tokens into URL params.

### `src/components/search-pagination.tsx`

Stateless link-based pagination. Renders `<a>` tags with `?page=N` while preserving all other current params. No client JS required.

## Navigation Entry Point

Add a search icon/link to the site header pointing to `/search`. Only visible when `canAccessArchive(session)` is true (subscriber or trial user).

## What Is Not In Scope

- Relevance ranking (no FTS5; can be added later if needed)
- Saved searches
- Search suggestions / autocomplete
- Admin or unauthenticated search

## Files Changed

| File                                   | Action                                   |
| -------------------------------------- | ---------------------------------------- |
| `src/lib/search.ts`                    | Create                                   |
| `src/app/search/page.tsx`              | Create                                   |
| `src/components/search-filters.tsx`    | Create                                   |
| `src/components/search-pagination.tsx` | Create                                   |
| `src/components/SiteNav.tsx`           | Modify — add search link for subscribers |

No DB migrations required. No new dependencies.
