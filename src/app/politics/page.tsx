import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { DigestGrid } from "@/components/DigestGrid";
import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import type { Article } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Politics",
  description:
    "Today's most important political stories, with balanced coverage and bias-labeled sources.",
  alternates: { canonical: "/politics" },
  keywords: [
    "political news",
    "US politics",
    "international news",
    "policy",
    "elections",
    "geopolitics",
  ],
  openGraph: {
    title: "Politics · The One Dollar Digest",
    description:
      "Today's most important political stories, with balanced coverage and bias-labeled sources.",
    images: [
      {
        url: "/politics/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The One Dollar Digest: Politics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      { url: "/politics/opengraph-image", alt: "The One Dollar Digest: Politics" },
    ],
  },
};

async function getArticles(): Promise<Article[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.digestDate, today!))
      .orderBy(desc(articles.importanceScore));

    return rows;
  } catch {
    return [];
  }
}

const getCachedArticles = unstable_cache(() => getArticles(), ["articles-politics"], {
  revalidate: 3600,
  tags: ["articles"],
});

export default async function PoliticsPage() {
  const articles = await getCachedArticles();

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--ink)" }}
    >
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-10 text-center">
        <p
          className="font-ui text-[0.575rem] tracking-[0.24em] uppercase mb-10 fade-in"
          style={{ color: "var(--ink-muted)", animationDelay: "0ms" }}
        >
          {formattedDate}
        </p>
        <h1
          className="font-display italic leading-[0.86] mb-12 fade-up"
          style={{
            color: "var(--ink)",
            fontSize: "clamp(3rem, 9vw, 6rem)",
            letterSpacing: "-0.035em",
            animationDelay: "50ms",
          }}
        >
          Politics
        </h1>
        <div
          className="h-px fade-in"
          style={{ backgroundColor: "var(--border)", animationDelay: "130ms" }}
        />
      </div>

      <main className="max-w-5xl mx-auto px-6 pb-24">
        <DigestGrid articles={articles} category="politics" label="Politics" />
      </main>

      <footer
        className="max-w-5xl mx-auto px-6 border-t pb-16 pt-8 flex items-center justify-between flex-wrap gap-4"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="font-ui text-[0.575rem] tracking-[0.08em] uppercase"
          style={{ color: "var(--ink-faint)" }}
        >
          © {today.getFullYear()} The One Dollar Digest
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
