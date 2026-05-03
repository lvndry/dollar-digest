import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { canAccessArchive } from "@/lib/access";
import { ArticleCard } from "@/components/ArticleCard";
import { db } from "@/lib/db";
import { bookmarks, articles } from "@/lib/schema";
import { eq, desc, getTableColumns } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Bookmarks",
};

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!canAccessArchive(session)) redirect("/");

  const savedArticles = await db
    .select(getTableColumns(articles))
    .from(bookmarks)
    .innerJoin(articles, eq(bookmarks.articleId, articles.id))
    .where(eq(bookmarks.userId, session.user.id))
    .orderBy(desc(bookmarks.createdAt));

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--ink)" }}
    >
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-24">
        <div className="mb-12">
          <p
            className="font-ui text-[0.6rem] tracking-[0.14em] uppercase mb-4"
            style={{ color: "var(--ink-muted)" }}
          >
            Your collection
          </p>
          <h1
            className="font-display italic text-[clamp(2.5rem,6vw,4rem)] tracking-tight leading-[0.93]"
            style={{ color: "var(--ink)" }}
          >
            Bookmarks
          </h1>
        </div>

        <div className="h-px mb-12" style={{ backgroundColor: "var(--border)" }} />

        {savedArticles.length === 0 ? (
          <div className="text-center py-24">
            <p
              className="font-display italic text-[1.5rem] mb-4"
              style={{ color: "var(--ink-muted)" }}
            >
              No bookmarks yet
            </p>
            <p
              className="font-ui text-[0.6875rem] tracking-[0.04em] mb-8"
              style={{ color: "var(--ink-faint)" }}
            >
              Save articles from their detail page to find them here.
            </p>
            <Link
              href="/"
              className="btn-accent font-ui text-[0.6875rem] tracking-[0.08em] uppercase px-5 py-3 border inline-block"
            >
              Read today's digest
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
            {savedArticles.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
