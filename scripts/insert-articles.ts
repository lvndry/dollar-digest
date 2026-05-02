import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import { fetchOgImages } from "./lib/og-image";
import { readFileSync } from "fs";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: bun ./scripts/insert-articles.ts <file.json>");
  process.exit(1);
}

const parsed = JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>[];
const dateMatch = filePath.match(/(\d{4}-\d{2}-\d{2})\.json$/);
const digestDate = dateMatch?.[1] ?? new Date().toISOString().split("T")[0]!;

console.log(`[insert] Fetching OG images for ${parsed.length} articles…`);
const imageUrls = await fetchOgImages(
  parsed.map((item) => (item.sourceUrl ? String(item.sourceUrl) : null)),
);
console.log(`[insert] Got ${imageUrls.filter(Boolean).length}/${parsed.length} images`);

const now = new Date().toISOString();
const rows = parsed.map((item, i) => ({
  title: String(item.title ?? ""),
  summary: String(item.summary ?? ""),
  source: String(item.source ?? ""),
  sourceUrl: item.sourceUrl ? String(item.sourceUrl) : null,
  category: String(item.category ?? "tech") as "tech" | "politics",
  subcategory: item.subcategory ? String(item.subcategory) : null,
  bias: (item.bias as "far-left" | "left" | "center" | "right" | "far-right") ?? null,
  publishedAt: item.publishedAt ? String(item.publishedAt) : digestDate,
  readingTimeMinutes: item.readingTimeMinutes ? Number(item.readingTimeMinutes) : null,
  importanceScore: item.importanceScore ? Number(item.importanceScore) : null,
  imageUrl: imageUrls[i] ?? null,
  digestDate,
  createdAt: now,
}));

await db.insert(articles).values(rows);
console.log(`[insert] Inserted ${rows.length} articles for ${digestDate} ✓`);
