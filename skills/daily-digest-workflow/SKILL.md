---
name: daily-digest-workflow
description: Shared operating policy for One Dollar Digest Jazz workflows. Use when running or authoring scheduled digest workflows that gather articles, validate sources, and write digest JSON.
tagline: Shared policy for scheduled One Dollar Digest workflows.
triggers:
  - daily digest
  - digest workflow
  - DIGEST_DATE
  - SEARCH_FROM_DATE
---

# Daily Digest Workflow

This skill is mandatory shared policy for every One Dollar Digest workflow. Category-specific `WORKFLOW.md` instructions extend this policy; they do not replace it.

## CI Operating Mode

You are running inside an automated CI pipeline. No user is present and no one will respond. Complete the workflow from start to finish without asking for confirmation or approval.

All tools are available and functional: `web_search`, `http_request`, `spawn_subagent`, `write_file`, and `execute_command` all work normally in this environment. Do not assume any tool is unavailable without actually attempting to call it.

If every `web_search` call returns a hard error, output an empty array `[]` and stop. Empty result sets are not hard errors; adapt the queries and continue.

## Required Date Setup

Run this command first:

```sh
echo ${TARGET_DATE:-$(date -u +%Y-%m-%d)}
```

Store the output as `DIGEST_DATE`.

Compute `SEARCH_FROM_DATE` as two calendar days before `DIGEST_DATE`, formatted `YYYY-MM-DD`. Use the wider discovery window for search, but final selection still belongs to `DIGEST_DATE`.

## Search Rules

After `DIGEST_DATE` and `SEARCH_FROM_DATE` are set, generate a fresh query plan for `DIGEST_DATE`. Do not reuse yesterday's queries without adapting them to the date and current news cycle.

Category-specific workflows define the required coverage dimensions, query counts, and query bundle ownership. Apply those category rules while following the shared search-window rules below.

Delegate discovery in parallel by spawning subagents for non-overlapping query bundles. Use judgment to choose the number of subagents based on the workflow's coverage dimensions, query count, and complexity. Each subagent owns its assigned bundle and must return only source-backed candidates in the category-specific candidate shape.

Every `web_search` call must pass date arguments as top-level tool arguments:

```json
{
  "query": "Describe the research goal and mention DIGEST_DATE",
  "searchQueries": ["concise keyword phrase"],
  "fromDate": "SEARCH_FROM_DATE",
  "toDate": "DIGEST_DATE",
  "maxResults": 30
}
```

Do not rely on putting dates only in query text. Query text can mention `DIGEST_DATE`, "today", or a concrete event, but the actual discovery window must come from `fromDate` and `toDate`.

When spawning subagents, explicitly pass `DIGEST_DATE` and `SEARCH_FROM_DATE` and require them to use this same `web_search` shape, defensive date filtering, source validation, and no-fabrication rules.

## Defensive Date Filtering

After each search bundle, do a defensive date-filtering pass before returning or selecting candidates:

- If the search result or fetched page exposes an issue/publication date, record it as `issueDate`
- Keep candidates whose `issueDate` equals `DIGEST_DATE`
- Drop candidates whose `issueDate` is before or after `DIGEST_DATE`
- If no usable issue date is available, keep the candidate for deeper verification rather than discarding it prematurely

If a search result has `publishedDate` before or after `DIGEST_DATE`, treat it as background unless the fetched source page clearly shows the story was published or materially updated on `DIGEST_DATE`.

Set `digestDate` to `DIGEST_DATE` in every final article JSON object. Set `publishedAt` to the source article's real publication or last-updated date when available. Use `DIGEST_DATE` only when the source page clearly confirms the story belongs to that date but does not expose a more precise timestamp.

## Research And Source Validation

Prefer primary and canonical sources: official statements, company blogs, papers, filings, advisories, court or government documents, Reuters/AP, or original reporting from reputable outlets.

Before writing final JSON, validate every final `sourceUrl` and every `sources[].url`:

- Use the HTTP fetch tool whenever available
- Always fetch redirects, aggregators, tag pages, shortened URLs, uncertain links, and search-result URLs
- Follow redirects and use the final canonical URL when the fetched page resolves successfully
- Confirm the final page returns a successful response (`2xx`)
- Confirm the page is not a 404, soft-404, blocked error page, search page, homepage, unrelated live blog, or unrelated article
- Confirm the fetched page title/body matches the story, source, and publication date
- Replace invalid links with a working canonical source; if no working source can be verified, skip the story

Never output an unverified, failed, homepage, search-result, soft-404, or unrelated `sourceUrl` or `sources[].url`.

## Candidate Handling

Collect source-backed candidates without capping the list. Merge duplicate coverage of the same event into one candidate or final story, combining verified sources in one `sources` array.

For each candidate that might reach the final digest, answer two or three concrete research questions before selection. If no source-backed answer is available after two attempts, skip the candidate. Never fabricate.

Include every story that passes the category-specific importance threshold. Do not drop qualifying stories just to hit a target count; the search engine already limits discovery.

## Output Contract

Write the full JSON array to the category-specific output file:

```text
output/<workflow-name>-DIGEST_DATE.json
```

Final objects must include these shared fields unless a category-specific workflow explicitly says otherwise:

```json
{
  "title": "Concise, specific headline",
  "summary": "Source-backed summary",
  "source": "Primary publication name",
  "sourceUrl": "Primary canonical article URL",
  "sources": [
    {
      "name": "Primary or corroborating publication name",
      "url": "Canonical article URL"
    }
  ],
  "issueDate": "YYYY-MM-DD if known; omit if unavailable",
  "category": "tech | politics | category-specific value",
  "publishedAt": "Actual source publication/update date, preferably ISO format",
  "digestDate": "DIGEST_DATE",
  "readingTimeMinutes": 3,
  "importanceScore": 0.85
}
```

Only output valid JSON arrays in files. Console progress logs are fine.

## Shared Quality Checklist

Before finishing, verify:

- Phase 0 ran and `DIGEST_DATE` is confirmed
- `SEARCH_FROM_DATE` is two calendar days before `DIGEST_DATE`
- Every `web_search` call used `fromDate: SEARCH_FROM_DATE` and `toDate: DIGEST_DATE`
- Any story with a known `issueDate` has `issueDate === DIGEST_DATE`
- Stories without a usable issue date were kept only after source verification
- Every final `sourceUrl` and `sources[].url` was fetched or otherwise validated
- Multi-source stories use one entry with a non-empty `sources` array
- `publishedAt` reflects the source article date; `digestDate` equals `DIGEST_DATE`
- JSON is valid and complete
- The output file was written to the category-specific path
