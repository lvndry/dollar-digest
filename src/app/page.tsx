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
    <main>
      <header className="masthead">
        <div className="masthead-meta">
          <span>{formattedDate}</span>
          <span className="masthead-dollar">$1 / MO</span>
          <span>ISSUE 001</span>
        </div>
        <hr className="masthead-rule-top" />
        <h1 className="masthead-title">THE DOLLAR DIGEST</h1>
        <hr className="masthead-rule-bottom" />
        <p className="masthead-tagline">
          AI-curated news that respects your time and wallet
        </p>
      </header>

      <DigestGrid
        articles={articles}
        category="tech"
        label="Technology"
      />

      <DigestGrid
        articles={articles}
        category="politics"
        label="Politics"
      />

      <footer className="digest-footer">
        <span className="footer-copy">
          © {today.getFullYear()} The Dollar Digest
        </span>
        <span className="footer-tagline">One dollar. Every story that matters.</span>
        <span className="footer-copy">Powered by AI</span>
      </footer>
    </main>
  );
}
