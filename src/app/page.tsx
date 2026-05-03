import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { DigestGrid } from "@/components/DigestGrid";
import { DateCalendar } from "@/components/DateCalendar";
import { ArchivePaywall } from "@/components/ArchivePaywall";
import { auth } from "@/auth";
import { canAccessArchive, canAccessDigestDate } from "@/lib/access";
import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import type { Article } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export const metadata: Metadata = {
  description:
    "Today's most important tech and political stories, AI-curated and clearly sourced.",
  alternates: { canonical: "/" },
  openGraph: {
    description:
      "Today's most important tech and political stories, AI-curated and clearly sourced.",
    images: [
      { url: "/opengraph-image", width: 1200, height: 630, alt: "The One Dollar Digest" },
    ],
  },
};

async function getArticles(date: string): Promise<Article[]> {
  try {
    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.digestDate, date))
      .orderBy(desc(articles.importanceScore));

    return rows;
  } catch {
    return [];
  }
}

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

const getCachedArticles = unstable_cache(
  (date: string) => getArticles(date),
  ["articles"],
  { revalidate: 3600, tags: ["articles"] },
);

const getCachedAvailableDates = unstable_cache(
  () => getAvailableDates(),
  ["available-dates"],
  { revalidate: 3600, tags: ["articles"] },
);

interface HomePageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const today = new Date().toISOString().split("T")[0]!;
  const selectedDate = params.date ?? today;
  const isToday = selectedDate === today;

  const session = await auth();
  const hasAccess = canAccessDigestDate(selectedDate, session);

  const [articles, availableDates] = await Promise.all([
    hasAccess ? getCachedArticles(selectedDate) : Promise.resolve([]),
    getCachedAvailableDates(),
  ]);

  const displayDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.onedollardigest.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "The One Dollar Digest",
    url: base,
    description:
      "AI-curated daily news digest. Technology and politics, clearly sourced, for $1/month.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${base}/?date={date}` },
      "query-input": "required name=date",
    },
  };

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--ink)" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Masthead */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-10 text-center">
        <p
          className="font-ui text-[0.575rem] tracking-[0.24em] uppercase mb-10 fade-in"
          style={{ color: "var(--ink-muted)", animationDelay: "0ms" }}
        >
          {isToday ? `Today · ${displayDate}` : displayDate}
        </p>

        <h1
          className="font-display italic leading-[0.86] mb-10 fade-up"
          style={{
            color: "var(--ink)",
            fontSize: "clamp(3rem, 9vw, 6rem)",
            letterSpacing: "-0.035em",
            animationDelay: "50ms",
          }}
        >
          The One Dollar
          <br />
          Digest
        </h1>

        <p
          className="font-body leading-relaxed max-w-xs mx-auto mb-10 fade-in"
          style={{
            color: "var(--ink-muted)",
            fontSize: "1rem",
            animationDelay: "130ms",
          }}
        >
          Tech and politics, clearly sourced.
          <br />
          One dollar a month.
        </p>

        {!session?.user && (
          <div className="mb-10 fade-in" style={{ animationDelay: "190ms" }}>
            <Link
              href="/login"
              className="inline-block font-ui text-[0.65rem] tracking-[0.12em] uppercase px-6 py-3 transition-opacity duration-150 hover:opacity-75"
              style={{
                color: "var(--bg)",
                backgroundColor: "var(--ink)",
              }}
            >
              Start free — 3 day trial
            </Link>
          </div>
        )}

        {/* Archive calendar */}
        <Suspense
          fallback={
            <div className="mt-6">
              <div
                className="flex items-center gap-2 mx-auto font-ui text-[0.6rem] tracking-[0.12em] uppercase w-fit"
                style={{ color: "var(--ink-muted)" }}
              >
                ▾ browse archive
              </div>
            </div>
          }
        >
          <DateCalendar
            availableDates={availableDates}
            selectedDate={selectedDate}
            canAccessArchive={canAccessArchive(session)}
          />
        </Suspense>

        <div
          className="mt-12 h-px fade-in"
          style={{ backgroundColor: "var(--border)", animationDelay: "260ms" }}
        />
      </div>

      {/* Article grids */}
      <main className="max-w-5xl mx-auto px-6 pb-24">
        {!hasAccess ? (
          <ArchivePaywall isSignedIn={!!session?.user} />
        ) : articles.length === 0 ? (
          <p
            className="text-center font-ui text-[0.6875rem] tracking-[0.06em] py-20"
            style={{ color: "var(--ink-muted)" }}
          >
            No digest available for this date.
          </p>
        ) : (
          <>
            <DigestGrid articles={articles} category="tech" label="Technology" />
            <DigestGrid articles={articles} category="politics" label="Politics" />
          </>
        )}
      </main>

      <footer
        className="max-w-5xl mx-auto px-6 border-t pb-16 pt-8 flex items-center justify-between flex-wrap gap-4"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="font-ui text-[0.575rem] tracking-[0.08em] uppercase"
          style={{ color: "var(--ink-faint)" }}
        >
          © {new Date().getFullYear()} The One Dollar Digest
        </span>
        <span
          className="font-display italic text-[0.875rem]"
          style={{ color: "var(--ink-muted)" }}
        >
          One dollar. Every story that matters.
        </span>
        <span className="flex items-center gap-4">
          <Link
            href="/contact"
            className="font-ui text-[0.575rem] tracking-[0.08em] uppercase transition-colors duration-150 hover:opacity-70"
            style={{ color: "var(--ink-faint)" }}
          >
            Contact
          </Link>
          <Link
            href="/privacy"
            className="font-ui text-[0.575rem] tracking-[0.08em] uppercase transition-colors duration-150 hover:opacity-70"
            style={{ color: "var(--ink-faint)" }}
          >
            Privacy
          </Link>
        </span>
      </footer>
    </div>
  );
}
