import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import type { NewArticle } from "@/lib/schema";
import { normalizeArticleSources } from "@/lib/parse-article-metadata";
import { db } from "@/lib/db";
import { articles } from "@/lib/schema";

function optionalString(value: unknown): string | null {
  return value ? String(value) : null;
}

function serializeStringArray(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  const strings = value.filter((item): item is string => typeof item === "string");
  return strings.length > 0 ? JSON.stringify(strings) : null;
}

function serializeMetadataField(value: unknown): string | null {
  return serializeStringArray(value) ?? optionalString(value);
}

function parseCategory(value: unknown): NewArticle["category"] | null {
  if (value == null) return "tech";
  if (value === "tech" || value === "politics") return value;
  return null;
}

export async function POST(request: NextRequest) {
  const ingestSecret = process.env.INGEST_SECRET;
  if (!ingestSecret) {
    return NextResponse.json(
      { error: "Ingest endpoint not configured" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${ingestSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rows: Record<string, unknown>[];
  try {
    rows = (await request.json()) as Record<string, unknown>[];
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Expected a non-empty array" }, { status: 400 });
  }

  const invalidCategoryIndex = rows.findIndex(
    (row) => parseCategory(row.category) === null,
  );
  if (invalidCategoryIndex !== -1) {
    return NextResponse.json(
      {
        error: `Invalid category at row ${invalidCategoryIndex}; expected "tech" or "politics"`,
      },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const today = now.split("T")[0];

  const prepared: NewArticle[] = rows.flatMap((row) => {
    const digestDate = optionalString(row.digestDate) ?? today;
    const category = parseCategory(row.category) ?? "tech";
    const whyItMatters = optionalString(row.whyItMatters);
    const technicalSignificance =
      optionalString(row.technicalSignificance) ??
      (category === "tech" ? whyItMatters : null);
    const strategicInterpretation =
      optionalString(row.strategicInterpretation) ??
      (category === "politics" ? whyItMatters : null);

    const sources = normalizeArticleSources(row);
    const primarySource = sources[0];
    const sourceUrl = optionalString(row.sourceUrl) ?? primarySource?.url ?? null;

    if (!sourceUrl) return [];

    return [
      {
        title: String(row.title ?? ""),
        summary: String(row.summary ?? ""),
        source: optionalString(row.source) ?? primarySource?.name ?? "",
        sourceUrl,
        sources: sources.length > 0 ? JSON.stringify(sources) : null,
        category,
        subcategory: optionalString(row.subcategory),
        bias: ((row.bias ?? primarySource?.bias) as NewArticle["bias"]) ?? null,
        publishedAt: optionalString(row.publishedAt) ?? today,
        readingTimeMinutes: row.readingTimeMinutes
          ? Number(row.readingTimeMinutes)
          : null,
        importanceScore: row.importanceScore ? Number(row.importanceScore) : null,
        imageUrl: optionalString(row.imageUrl),
        tags: serializeMetadataField(row.tags),
        regions: serializeMetadataField(row.regions),
        primaryRegion: optionalString(row.primaryRegion),
        strategicInterpretation,
        technicalSignificance,
        digestDate,
        createdAt: optionalString(row.createdAt) ?? now,
      },
    ];
  });

  const seenTitles = new Set<string>();
  const deduped = prepared.filter((row) => {
    const key = row.title.toLowerCase().trim();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });

  await db.insert(articles).values(deduped).onConflictDoNothing();

  revalidateTag("articles", "default");

  return NextResponse.json({ inserted: deduped.length });
}
