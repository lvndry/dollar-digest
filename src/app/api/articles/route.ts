import { NextResponse } from "next/server";
import { mockArticles } from "@/lib/mock-data";

export async function GET() {
  try {
    const { db } = await import("@/lib/db");
    const { articles } = await import("@/lib/schema");
    const { desc, eq } = await import("drizzle-orm");

    const today = new Date().toISOString().split("T")[0];
    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.digestDate, today))
      .orderBy(desc(articles.importanceScore));

    if (rows.length > 0) {
      return NextResponse.json(rows);
    }
  } catch {
    // DB not initialised yet — fall through to mock data
  }

  return NextResponse.json(mockArticles);
}
