import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ ready: false });
  }

  try {
    const { db } = await import("@/lib/db");
    const { articles } = await import("@/lib/schema");
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.digestDate, date))
      .limit(1);

    return NextResponse.json({ ready: rows.length > 0 });
  } catch {
    return NextResponse.json({ ready: false });
  }
}
