import { unstable_cache } from "next/cache";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles } from "@/lib/schema";

async function getAvailableDates(): Promise<string[]> {
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

/** Refresh at most every 2 hours. Ingestions purge this cache immediately via the 'articles' tag. */
export const getCachedAvailableDates = unstable_cache(
  getAvailableDates,
  ["available-dates"],
  {
    revalidate: 7200,
    tags: ["articles"],
  },
);
