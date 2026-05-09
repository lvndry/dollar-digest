import { cacheLife, cacheTag } from "next/cache";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles } from "@/lib/schema";

/** Refresh at most every 2 hours. Ingestions purge this cache immediately via the 'articles' tag. */
export async function getCachedAvailableDates(): Promise<string[]> {
  "use cache";
  cacheTag("articles");
  cacheLife({ revalidate: 7200 });

  try {
    const rows = await db
      .selectDistinct({ digestDate: articles.digestDate })
      .from(articles)
      .orderBy(desc(articles.digestDate));

    return rows.map((r) => r.digestDate);
  } catch {
    return [];
  }
}
