import type { Session } from "next-auth";
import { unstable_cache } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { canAccessDigestDate } from "@/lib/access";
import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import type { Article } from "@/lib/schema";

/** UTC calendar date `YYYY-MM-DD` for “today” (matches existing pages). */
export function digestTodayIso(): string {
  return new Date().toISOString().split("T")[0]!;
}

export function resolveDigestDate(params: { date?: string }): {
  today: string;
  selectedDate: string;
  isToday: boolean;
} {
  const today = digestTodayIso();
  const selectedDate = params.date ?? today;
  return { today, selectedDate, isToday: selectedDate === today };
}

export function formatDigestDisplayDate(selectedDate: string): string {
  return new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Matches `DigestGrid` category filter — use for empty-state checks on category pages. */
export function countDigestArticlesForCategory(
  rows: Article[],
  category: "tech" | "politics",
): number {
  return rows.filter((a) => a.category === category).length;
}

/** `?date=` for links from home to category tabs when viewing an archive day. */
export function digestDateQuerySuffix(selectedDate: string, today: string): string {
  return selectedDate !== today ? `?date=${encodeURIComponent(selectedDate)}` : "";
}

async function fetchArticlesForDigestDate(date: string): Promise<Article[]> {
  try {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.digestDate, date))
      .orderBy(desc(articles.importanceScore));
  } catch {
    return [];
  }
}

/** Shared across home, tech, and politics so navigation reuses one cache entry per date. */
export const getCachedArticlesForDigestDate = unstable_cache(
  (date: string) => fetchArticlesForDigestDate(date),
  ["articles"],
  { revalidate: 3600, tags: ["articles"] },
);

export type DigestDayContext = {
  session: Session | null;
  today: string;
  selectedDate: string;
  isToday: boolean;
  hasAccess: boolean;
  articles: Article[];
  displayDate: string;
  dateQuerySuffix: string;
};

export async function loadDigestDay(
  searchParams: Promise<{ date?: string }>,
): Promise<DigestDayContext> {
  const params = await searchParams;
  const { today, selectedDate, isToday } = resolveDigestDate(params);
  const session = await auth();
  const hasAccess = canAccessDigestDate(selectedDate, session);
  const rows = hasAccess ? await getCachedArticlesForDigestDate(selectedDate) : [];

  return {
    session,
    today,
    selectedDate,
    isToday,
    hasAccess,
    articles: rows,
    displayDate: formatDigestDisplayDate(selectedDate),
    dateQuerySuffix: digestDateQuerySuffix(selectedDate, today),
  };
}
