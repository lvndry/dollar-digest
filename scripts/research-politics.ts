import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import { chat, extractJson } from "./lib/openrouter";
import { fetchOgImages } from "./lib/og-image";
import { fetchFeed, filterRecent } from "./lib/rss";

const MODEL = "deepseek/deepseek-v4-flash";

// Feeds spanning the bias spectrum — the LLM labels each story based on source reputation
const FEEDS: { url: string; knownBias: string }[] = [
  { url: "https://feeds.apnews.com/rss/apf-politics", knownBias: "center" },
  { url: "https://feeds.reuters.com/reuters/politicsNews", knownBias: "center" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", knownBias: "center" },
  { url: "https://www.theguardian.com/world/rss", knownBias: "left" },
  { url: "https://moxie.foxnews.com/google-publisher/politics.xml", knownBias: "right" },
  { url: "https://www.politico.com/rss/politicopicks.xml", knownBias: "center" },
  { url: "https://thehill.com/feed/", knownBias: "center" },
];

async function main() {
  const digestDate = new Date().toISOString().split("T")[0];

  console.log(`[political-news] Fetching feeds for ${digestDate}…`);

  const results = await Promise.allSettled(FEEDS.map((f) => fetchFeed(f.url)));
  const allItems = results
    .filter(
      (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchFeed>>> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value);

  const recent = filterRecent(allItems);
  console.log(
    `[political-news] ${recent.length} articles in the last 26h across ${FEEDS.length} feeds`,
  );

  if (recent.length === 0) {
    console.log("[political-news] Nothing to process.");
    return;
  }

  const articleList = recent
    .slice(0, 60)
    .map(
      (item, i) =>
        `${i + 1}. ${item.title}\n   Source URL: ${item.link}\n   ${item.description.slice(0, 200)}`,
    )
    .join("\n\n");

  const prompt = `Today is ${digestDate}. From these recent political news articles, select and summarize the 6–10 most important stories.

${articleList}

Return ONLY a valid JSON array — no markdown, no extra text. Each object:
{
  "title": "factual, neutral headline — no spin from either side",
  "summary": "2–3 sentences. Facts only: who, what, where, immediate consequence. No editorialising.",
  "source": "publication name",
  "sourceUrl": "full article URL",
  "category": "politics",
  "subcategory": null,
  "bias": "far-left" | "left" | "center" | "right" | "far-right",
  "publishedAt": "YYYY-MM-DD",
  "readingTimeMinutes": number,
  "importanceScore": 0.0–1.0
}

Bias label guide — rate the SOURCE, not the story content:
- far-left: Jacobin, HuffPost opinion, MSNBC opinion
- left: NYT, WaPo, Guardian, NPR, BBC
- center: Reuters, AP, Axios, The Hill news, Politico news
- right: WSJ news desk, NY Post news, Fox News reporting
- far-right: Breitbart, Daily Wire opinion

For high-importance stories, include two entries from sources of differing bias so readers see different framings.

Importance scoring:
- 0.9–1.0: major legislation passed, election results, military escalation, head-of-state decision
- 0.7–0.9: significant policy proposal, major court ruling, large-scale protest
- 0.5–0.7: committee vote, minor regulatory action, political appointment`;

  console.log("[political-news] Calling OpenRouter…");
  const raw = await chat(MODEL, [
    {
      role: "system",
      content:
        "You are a senior political news editor committed to factual, balanced reporting. You label source bias accurately and return valid JSON.",
    },
    { role: "user", content: prompt },
  ]);

  const parsed = extractJson(raw) as Record<string, unknown>[];

  console.log(`[political-news] Fetching OG images for ${parsed.length} articles…`);
  const imageUrls = await fetchOgImages(
    parsed.map((item) => (item.sourceUrl ? String(item.sourceUrl) : null)),
  );
  console.log(
    `[political-news] Got ${imageUrls.filter(Boolean).length}/${parsed.length} images`,
  );

  const now = new Date().toISOString();
  const rows = parsed.map((item, i) => ({
    title: String(item.title ?? ""),
    summary: String(item.summary ?? ""),
    source: String(item.source ?? ""),
    sourceUrl: item.sourceUrl ? String(item.sourceUrl) : null,
    category: "politics" as const,
    subcategory: null,
    bias: (item.bias as "far-left" | "left" | "center" | "right" | "far-right") ?? null,
    publishedAt: item.publishedAt ? String(item.publishedAt) : digestDate,
    readingTimeMinutes: item.readingTimeMinutes ? Number(item.readingTimeMinutes) : null,
    importanceScore: item.importanceScore ? Number(item.importanceScore) : null,
    imageUrl: imageUrls[i] ?? null,
    digestDate,
    createdAt: now,
  }));

  await db.insert(articles).values(rows);
  console.log(`[political-news] Inserted ${rows.length} articles for ${digestDate} ✓`);
}

main().catch((err) => {
  console.error("[political-news] Fatal:", err);
  process.exit(1);
});
