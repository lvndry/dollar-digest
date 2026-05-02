import type { Metadata } from "next";
import { DigestGrid } from "@/components/DigestGrid";
import { SiteNav } from "@/components/SiteNav";
import type { Article } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Today's Digest",
  description:
    "Today's most important tech and political stories — AI-curated, clearly sourced.",
  openGraph: {
    title: "The Dollar Digest — Today",
    description:
      "Today's most important tech and political stories — AI-curated, clearly sourced.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
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

    if (rows.length > 0) return rows;
  } catch {
    // DB not ready — use mock data
  }

  const { mockArticles } = await import("@/lib/mock-data");
  return mockArticles;
}

export default async function HomePage() {
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

      {/* Masthead */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-14 text-center">
        <p
          className="font-ui text-[0.6rem] tracking-[0.14em] uppercase mb-8"
          style={{ color: "var(--ink-muted)" }}
        >
          {formattedDate}
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
        <div className="mt-12 h-px" style={{ backgroundColor: "var(--border)" }} />
      </div>

      {/* Article grids */}
      <main className="max-w-5xl mx-auto px-6 pb-24">
        <DigestGrid articles={articles} category="tech" label="Technology" />
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
