import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import { chat, extractJson } from "./lib/openrouter";
import { fetchFeed, filterRecent } from "./lib/rss";

const MODEL = "deepseek/deepseek-v4-flash";

const FEEDS = [
  "https://hnrss.org/frontpage",
  "https://techcrunch.com/feed/",
  "https://www.theverge.com/rss/index.xml",
  "https://feeds.arstechnica.com/arstechnica/index",
  "https://www.wired.com/feed/rss",
];

async function main() {
  const digestDate = new Date().toISOString().split("T")[0];

  console.log(`[tech-news] Fetching feeds for ${digestDate}…`);

  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const allItems = results
    .filter(
      (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchFeed>>> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value);

  const recent = filterRecent(allItems);
  console.log(
    `[tech-news] ${recent.length} articles in the last 26h across ${FEEDS.length} feeds`,
  );

  if (recent.length === 0) {
    console.log("[tech-news] Nothing to process.");
    return;
  }

  const articleList = recent
    .slice(0, 60)
    .map(
      (item, i) =>
        `${i + 1}. ${item.title}\n   URL: ${item.link}\n   ${item.description.slice(0, 200)}`,
    )
    .join("\n\n");

  const prompt = `Today is ${digestDate}. From these recent tech news articles, select and summarize the 8–12 most important stories. Aim for at least one per subcategory where possible.

${articleList}

Return ONLY a valid JSON array — no markdown, no extra text. Each object:
{
  "title": "concise, specific headline — no clickbait",
  "summary": "2–3 sentences. Lead with the key fact. Include numbers, names, outcomes.",
  "source": "publication name",
  "sourceUrl": "full article URL",
  "category": "tech",
  "subcategory": "AI" | "VC" | "Research" | "Startup" | "Product" | "Security",
  "publishedAt": "YYYY-MM-DD",
  "readingTimeMinutes": number,
  "importanceScore": 0.0–1.0
}

Subcategory guide:
- AI: model releases, benchmarks, AI safety, foundation models, inference hardware
- VC: funding rounds, acquisitions, valuations, exits
- Research: academic papers, lab discoveries, university studies
- Startup: early-stage companies, pivots, launches, founder stories
- Product: feature releases or redesigns at established companies
- Security: vulnerabilities, breaches, patches, threat research

Importance scoring:
- 0.9–1.0: industry-shifting (major model release, $1B+ deal, critical CVE)
- 0.7–0.9: significant (solid Series B, notable paper, meaningful product launch)
- 0.5–0.7: worth knowing (small round, minor update, niche research)`;

  console.log("[tech-news] Calling OpenRouter…");
  const raw = await chat(MODEL, [
    {
      role: "system",
      content:
        "You are a senior tech news editor. You write tight, factual summaries and return valid JSON.",
    },
    { role: "user", content: prompt },
  ]);

  const parsed = extractJson(raw) as Record<string, unknown>[];
  const now = new Date().toISOString();

  const rows = parsed.map((item) => ({
    title: String(item.title ?? ""),
    summary: String(item.summary ?? ""),
    source: String(item.source ?? ""),
    sourceUrl: item.sourceUrl ? String(item.sourceUrl) : null,
    category: "tech" as const,
    subcategory: item.subcategory ? String(item.subcategory) : null,
    bias: null,
    publishedAt: item.publishedAt ? String(item.publishedAt) : digestDate,
    readingTimeMinutes: item.readingTimeMinutes ? Number(item.readingTimeMinutes) : null,
    importanceScore: item.importanceScore ? Number(item.importanceScore) : null,
    digestDate,
    createdAt: now,
  }));

  await db.insert(articles).values(rows);
  console.log(`[tech-news] Inserted ${rows.length} articles for ${digestDate} ✓`);
}

main().catch((err) => {
  console.error("[tech-news] Fatal:", err);
  process.exit(1);
});
