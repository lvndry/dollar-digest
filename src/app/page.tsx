import { DigestGrid } from "@/components/DigestGrid";
import type { Article } from "@/lib/schema";

async function getArticles(): Promise<Article[]> {
  try {
    const { db } = await import("@/lib/db");
    const { articles } = await import("@/lib/schema");
    const { desc, eq } = await import("drizzle-orm");

    const today = new Date().toISOString().split("T")[0];
    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.digestDate, today))
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
  const formattedDate = today
    .toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  return (
    <main className="min-h-screen bg-paper text-ink font-body leading-[1.65]">
      {/* Masthead */}
      <header className="max-w-[1320px] mx-auto px-[clamp(1.25rem,4vw,3rem)] pt-8 mb-10">
        <div className="flex justify-between items-baseline mb-3">
          <span className="font-ui text-[0.6875rem] tracking-[0.1em] uppercase text-ink-muted">
            {formattedDate}
          </span>
          <span className="font-ui text-[0.6875rem] tracking-[0.05em] font-bold text-gold border border-gold px-2 py-0.5">
            $1 / MO
          </span>
          <span className="font-ui text-[0.6875rem] tracking-[0.1em] uppercase text-ink-muted">
            ISSUE 001
          </span>
        </div>

        <div className="h-0.5 bg-ink mb-2" />

        <h1 className="font-display font-extrabold text-[clamp(2.75rem,9vw,6.5rem)] tracking-[-0.03em] leading-[0.9] text-center text-ink">
          THE DOLLAR DIGEST
        </h1>

        <div className="h-px bg-ink mt-2.5" />

        <p className="font-ui text-[0.6875rem] tracking-[0.06em] uppercase text-ink-muted text-center pt-2.5 pb-6">
          AI-curated news that respects your time and wallet
        </p>
      </header>

      <DigestGrid articles={articles} category="tech" label="Technology" />
      <DigestGrid articles={articles} category="politics" label="Politics" />

      <footer className="max-w-[1320px] mx-auto px-[clamp(1.25rem,4vw,3rem)] border-t-2 border-ink pt-6 pb-12 flex justify-between items-center gap-4">
        <span className="font-ui text-[0.6rem] tracking-[0.08em] uppercase text-ink-faint">
          © {today.getFullYear()} The Dollar Digest
        </span>
        <span className="font-display italic text-[0.875rem] text-ink-muted">
          One dollar. Every story that matters.
        </span>
        <span className="font-ui text-[0.6rem] tracking-[0.08em] uppercase text-ink-faint">
          Powered by AI
        </span>
      </footer>
    </main>
  );
}
