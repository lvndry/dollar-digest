import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { NewArticle } from "@/lib/schema";

export async function POST(request: NextRequest) {
  const rows: NewArticle[] = await request.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Expected a non-empty array" }, { status: 400 });
  }

  const { db } = await import("@/lib/db");
  const { articles } = await import("@/lib/schema");

  const now = new Date().toISOString();
  const today = now.split("T")[0];

  const prepared = rows.map((row) => ({
    ...row,
    digestDate: row.digestDate ?? today,
    createdAt: row.createdAt ?? now,
  }));

  await db.insert(articles).values(prepared).onConflictDoNothing();

  return NextResponse.json({ inserted: prepared.length });
}
