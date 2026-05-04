import { db } from "@/lib/db";
import { normalizeArticleSources } from "@/lib/parse-article-metadata";
import { articles } from "@/lib/schema";
import { fetchOgImages } from "./lib/og-image";
import { readFileSync } from "fs";

function normalizeUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // Normalize protocol and drop tracking params
    parsed.protocol = "https:";
    parsed.hostname = parsed.hostname.replace(/^www\./, "");
    for (const key of [...parsed.searchParams.keys()]) {
      if (/^utm_|^fbclid$|^gclid$|^ref$/.test(key)) parsed.searchParams.delete(key);
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: bun ./scripts/insert-articles.ts <file.json>");
  process.exit(1);
}

const parsed = JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>[];
const dateMatch = filePath.match(/(\d{4}-\d{2}-\d{2})\.json$/);
const digestDate = dateMatch?.[1] ?? new Date().toISOString().split("T")[0]!;

function optionalString(value: unknown): string | null {
  return value ? String(value) : null;
}

function serializeMetadataField(value: unknown): string | null {
  if (Array.isArray(value)) return JSON.stringify(value);
  return value != null ? String(value) : null;
}

const normalizedSources = parsed.map((item) => normalizeArticleSources(item));

console.log(`[insert] Fetching OG images for ${parsed.length} articles…`);
const imageUrls = await fetchOgImages(
  parsed.map(
    (item, index) =>
      optionalString(item.sourceUrl) ?? normalizedSources[index]?.[0]?.url ?? null,
  ),
);
console.log(`[insert] Got ${imageUrls.filter(Boolean).length}/${parsed.length} images`);

const now = new Date().toISOString();

const rows = parsed.map((item, i) => {
  const sources = normalizedSources[i] ?? [];
  const primarySource = sources[0];

  return {
    title: String(item.title ?? ""),
    summary: String(item.summary ?? ""),
    source: optionalString(item.source) ?? primarySource?.name ?? "",
    sourceUrl: normalizeUrl(optionalString(item.sourceUrl) ?? primarySource?.url ?? null),
    sources: sources.length > 0 ? JSON.stringify(sources) : null,
    category: String(item.category ?? "tech") as "tech" | "politics",
    subcategory: item.subcategory ? String(item.subcategory) : null,
    bias:
      ((item.bias ?? primarySource?.bias) as
        | "far-left"
        | "left"
        | "center"
        | "right"
        | "far-right") ?? null,
    publishedAt: item.publishedAt ? String(item.publishedAt) : digestDate,
    readingTimeMinutes: item.readingTimeMinutes ? Number(item.readingTimeMinutes) : null,
    importanceScore: item.importanceScore ? Number(item.importanceScore) : null,
    imageUrl: imageUrls[i] ?? null,
    tags: serializeMetadataField(item.tags),
    regions: serializeMetadataField(item.regions),
    primaryRegion: item.primaryRegion ? String(item.primaryRegion) : null,
    strategicInterpretation: item.strategicInterpretation
      ? String(item.strategicInterpretation)
      : null,
    digestDate,
    createdAt: now,
  };
});

// Deduplicate within the batch by normalized title before hitting the DB
const seenTitles = new Set<string>();
const dedupedRows = rows.filter((row) => {
  const key = row.title.toLowerCase().trim();
  if (seenTitles.has(key)) return false;
  seenTitles.add(key);
  return true;
});

if (dedupedRows.length < rows.length) {
  console.log(`[insert] Dropped ${rows.length - dedupedRows.length} in-batch duplicates`);
}

if (dedupedRows.length === 0) {
  console.log(`[insert] No articles to insert for ${digestDate} — all duplicates`);
  process.exit(0);
}

const result = await db.insert(articles).values(dedupedRows).onConflictDoNothing();
console.log(
  `[insert] Inserted ${result.rowsAffected} / ${dedupedRows.length} articles for ${digestDate} ✓`,
);
