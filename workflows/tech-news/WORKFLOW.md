---
name: tech-news
description: Daily tech news digest — categorised as AI, VC, Research, Startup, Product, or Security
schedule: "0 7 * * *"
autoApprove: true
catchUpOnStartup: true
maxIterations: 60
---

# Tech News Digest

Search the web for today's most important tech stories. Cover the full spectrum: AI/ML breakthroughs, venture funding rounds, academic research, new product launches, startup news, and security vulnerabilities.

For each story you find, produce a JSON object with these exact fields:

```json
{
  "title": "Concise, specific headline (no clickbait)",
  "summary": "2–3 sentence summary. Lead with the most important fact. Be precise — include numbers, names, and outcomes where relevant.",
  "source": "Publication name",
  "sourceUrl": "Full article URL",
  "category": "tech",
  "subcategory": "AI | VC | Research | Startup | Product | Security",
  "publishedAt": "YYYY-MM-DD",
  "readingTimeMinutes": 3,
  "importanceScore": 0.85
}
```

**Subcategory definitions:**

- **AI** — model releases, benchmarks, AI safety, foundation models, inference
- **VC** — funding rounds, acquisitions, valuations, investor activity
- **Research** — academic papers, university studies, lab discoveries
- **Startup** — early-stage companies, pivots, launches, founder stories
- **Product** — feature releases, redesigns, platform changes at established companies
- **Security** — vulnerabilities, breaches, patches, threat research

**Scoring guidance (importanceScore 0–1):**

- 0.9–1.0: Industry-shifting (GPT-5 launch, $1B+ acquisition, critical zero-day)
- 0.7–0.9: Significant but not seismic (solid Series B, notable paper, meaningful product launch)
- 0.5–0.7: Worth knowing (small funding round, minor product update, niche research)
- Below 0.5: Skip it

**Quality bar:**

- Aim for 8–12 stories total
- At least one story per subcategory if possible
- Prefer primary sources (company blog, paper PDF, official announcement) over aggregators
- No duplicate stories covering the same event

After gathering all stories:

1. Write the results as a JSON array to `output/tech-news-YYYY-MM-DD.json` where YYYY-MM-DD is today's date.
2. Run `bun ./scripts/insert-articles.ts output/tech-news-YYYY-MM-DD.json` to insert the articles into the database.
