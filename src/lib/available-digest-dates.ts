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

/** When we have digest dates, refresh at most every 2 hours. */
const REVALIDATE_SECONDS_WHEN_HAS_DATES = 7200;
/** When the digest is still empty, re-check the DB often so new ingests show up quickly. */
const REVALIDATE_SECONDS_WHEN_EMPTY = 60;

const getAvailableDatesLongTtl = unstable_cache(
  getAvailableDates,
  ["available-dates", "long"],
  {
    revalidate: REVALIDATE_SECONDS_WHEN_HAS_DATES,
    tags: ["articles"],
  },
);

const getAvailableDatesShortTtlWhenEmpty = unstable_cache(
  getAvailableDates,
  ["available-dates", "empty"],
  {
    revalidate: REVALIDATE_SECONDS_WHEN_EMPTY,
    tags: ["articles"],
  },
);

export async function getCachedAvailableDates(): Promise<string[]> {
  const fromLongTtl = await getAvailableDatesLongTtl();
  if (fromLongTtl.length > 0) {
    return fromLongTtl;
  }
  return getAvailableDatesShortTtlWhenEmpty();
}
