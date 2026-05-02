---
name: political-news
description: Daily political news digest with source bias indicators (left / center / right)
schedule: "30 7 * * *"
autoApprove: true
catchUpOnStartup: true
maxIterations: 60
---

# Political News Digest

Search the web for today's most important political stories — domestic policy, international affairs, elections, legislation, and geopolitics.

For every story, identify the **source's political lean** based on established media bias ratings (AllSides, Ad Fontes Media). Label it honestly:

| Value       | Meaning                                    |
| ----------- | ------------------------------------------ |
| `far-left`  | MSNBC opinion, Jacobin, HuffPost           |
| `left`      | NYT, WaPo, Guardian, NPR                   |
| `center`    | Reuters, AP, BBC, Axios                    |
| `right`     | WSJ news, NY Post news, Fox News reporting |
| `far-right` | Breitbart, Daily Wire opinion              |

**Important:** This label is about the _source's known lean_, not the story's content. A Reuters article about a Republican policy win is still `center`. Aim to include sources from multiple points on the spectrum for the same story where possible.

For each story, produce a JSON object with these exact fields:

```json
{
  "title": "Factual, neutral headline — no spin",
  "summary": "2–3 sentences. State facts only. Include who, what, where, and the immediate consequence. No editorialising.",
  "source": "Publication name",
  "sourceUrl": "Full article URL",
  "category": "politics",
  "subcategory": null,
  "bias": "far-left | left | center | right | far-right",
  "publishedAt": "YYYY-MM-DD",
  "readingTimeMinutes": 4,
  "importanceScore": 0.85
}
```

**Scoring guidance (importanceScore 0–1):**

- 0.9–1.0: Major legislation passed, election results, military conflict escalation, head-of-state decision
- 0.7–0.9: Significant policy proposal, major court ruling, large-scale protest
- 0.5–0.7: Committee vote, minor regulatory action, political appointment
- Below 0.5: Skip it

**Quality bar:**

- 6–10 stories total
- Prioritise stories with concrete, verified outcomes over speculation
- For high-importance stories, include two versions from sources of different bias so readers can see how coverage differs
- Neutral, factual summaries only — the bias label does the framing work

After gathering all stories, write the results as a JSON array to `output/political-news-YYYY-MM-DD.json` where YYYY-MM-DD is today's date.

Then insert each article into the Dollar Digest database by making a POST request to `http://localhost:3000/api/articles/ingest` with the JSON array as the body.
