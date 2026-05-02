import type { Metadata } from "next";
import { DigestGrid } from "@/components/DigestGrid";
import { SiteNav } from "@/components/SiteNav";
import type { Article } from "@/lib/schema";

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
    title: "Politics · The Dollar Digest",
    description:
      "Today's most important political stories, with balanced coverage and bias-labeled sources.",
    images: [
      {
        url: "/politics/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The Dollar Digest: Politics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: "/politics/opengraph-image", alt: "The Dollar Digest: Politics" }],
  },
};

async function getArticles(): Promise<Article[]> {
  try {
    const { db } = await import("@/lib/db");
    const { articles } = await import("@/lib/schema");
    const { desc, eq } = await import("drizzle-orm");

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

export default async function PoliticsPage() {
  const articles = await getArticles();

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
      <SiteNav />

      <div className="max-w-5xl mx-auto px-6 pt-16 pb-14 text-center">
        <p
          className="font-ui text-[0.6rem] tracking-[0.14em] uppercase mb-8"
          style={{ color: "var(--ink-muted)" }}
        >
          {formattedDate}
        </p>
        <h1
          className="font-display italic text-[clamp(2.25rem,6vw,4.5rem)] tracking-[-0.025em] leading-[0.93] mb-6"
          style={{ color: "var(--ink)" }}
        >
          Politics
        </h1>
        <div className="mt-12 h-px" style={{ backgroundColor: "var(--border)" }} />
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
          © {today.getFullYear()} The Dollar Digest
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
