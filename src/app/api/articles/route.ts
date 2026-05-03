import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
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
    // DB not initialised yet.
  }

  return NextResponse.json([]);
}
