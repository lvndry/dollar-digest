import type { Metadata } from "next";
import { Suspense } from "react";
import { DigestGrid } from "@/components/DigestGrid";
import { SiteNav } from "@/components/SiteNav";
import { DateCalendar } from "@/components/DateCalendar";
import type { Article } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Today's Digest",
  description:
    "Today's most important tech and political stories — AI-curated, clearly sourced.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Dollar Digest — Today",
    description:
      "Today's most important tech and political stories — AI-curated, clearly sourced.",
    images: [
      { url: "/opengraph-image", width: 1200, height: 630, alt: "The Dollar Digest" },
    ],
  },
};

async function getArticles(date: string): Promise<Article[]> {
  try {
    const { db } = await import("@/lib/db");
    const { articles } = await import("@/lib/schema");
    const { desc, eq } = await import("drizzle-orm");

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
    const { db } = await import("@/lib/db");
    const { articles } = await import("@/lib/schema");
    const { desc } = await import("drizzle-orm");

    const rows = await db
      .selectDistinct({ digestDate: articles.digestDate })
      .from(articles)
      .orderBy(desc(articles.digestDate));

    return rows.map((r) => r.digestDate);
  } catch {
    return [];
  }
}

interface HomePageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const today = new Date().toISOString().split("T")[0]!;
  const selectedDate = params.date ?? today;

  const [articles, availableDates] = await Promise.all([
    getArticles(selectedDate),
    getAvailableDates(),
  ]);

  const displayDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isToday = selectedDate === today;

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://dollardigest.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "The Dollar Digest",
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
      <SiteNav />

      {/* Masthead */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-14 text-center">
        <p
          className="font-ui text-[0.6rem] tracking-[0.14em] uppercase mb-8"
          style={{ color: "var(--ink-muted)" }}
        >
          {isToday ? `Today — ${displayDate}` : displayDate}
        </p>
        <h1
          className="font-display italic text-[clamp(2.75rem,8vw,5.75rem)] tracking-[-0.025em] leading-[0.93] mb-6"
          style={{ color: "var(--ink)" }}
        >
          The Dollar Digest
        </h1>
        <p
          className="font-ui text-[0.6875rem] tracking-[0.06em] uppercase"
          style={{ color: "var(--ink-muted)" }}
        >
          AI-curated news that respects your time and wallet
        </p>

        {/* Archive calendar */}
        <Suspense>
          <DateCalendar availableDates={availableDates} selectedDate={selectedDate} />
        </Suspense>

        <div className="mt-8 h-px" style={{ backgroundColor: "var(--border)" }} />
      </div>

      {/* Article grids */}
      <main className="max-w-5xl mx-auto px-6 pb-24">
        {articles.length === 0 ? (
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
          © {new Date().getFullYear()} The Dollar Digest
        </span>
        <span
          className="font-display italic text-[0.875rem]"
          style={{ color: "var(--ink-muted)" }}
        >
          One dollar. Every story that matters.
        </span>
        <span
          className="font-ui text-[0.575rem] tracking-[0.08em] uppercase"
          style={{ color: "var(--ink-faint)" }}
        >
          Powered by AI
        </span>
      </footer>
    </div>
  );
}
