import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { NewArticle } from "@/lib/schema";

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

function serializeMetadataAlias(primary: unknown, fallback: unknown): string | null {
  return serializeStringArray(primary) ?? optionalString(fallback);
}

export async function POST(request: NextRequest) {
  const rows = (await request.json()) as Record<string, unknown>[];

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Expected a non-empty array" }, { status: 400 });
  }

  const { db } = await import("@/lib/db");
  const { articles } = await import("@/lib/schema");

  const now = new Date().toISOString();
  const today = now.split("T")[0];

  const prepared: NewArticle[] = rows.map((row) => ({
    title: String(row.title ?? ""),
    summary: String(row.summary ?? ""),
    source: String(row.source ?? ""),
    sourceUrl: optionalString(row.sourceUrl),
    category: String(row.category ?? "tech") as "tech" | "politics",
    subcategory: optionalString(row.subcategory),
    bias: (row.bias as NewArticle["bias"]) ?? null,
    publishedAt: optionalString(row.publishedAt) ?? today,
    readingTimeMinutes: row.readingTimeMinutes ? Number(row.readingTimeMinutes) : null,
    importanceScore: row.importanceScore ? Number(row.importanceScore) : null,
    imageUrl: optionalString(row.imageUrl),
    tags: serializeMetadataField(row.tags),
    politicalTopics: serializeMetadataAlias(row.topics, row.politicalTopics),
    politicalRegions: serializeMetadataAlias(row.regions, row.politicalRegions),
    strategicInterpretation: optionalString(row.strategicInterpretation),
    digestDate: optionalString(row.digestDate) ?? today,
    createdAt: optionalString(row.createdAt) ?? now,
  }));

  await db.insert(articles).values(prepared).onConflictDoNothing();

  return NextResponse.json({ inserted: prepared.length });
}
