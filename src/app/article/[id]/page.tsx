import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Article } from "@/lib/schema";

async function getArticle(id: string): Promise<Article | null> {
  try {
    const { db } = await import("@/lib/db");
    const { articles } = await import("@/lib/schema");
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.id, parseInt(id, 10)))
      .limit(1);

    return rows[0] ?? null;
  } catch {
    const { mockArticles } = await import("@/lib/mock-data");
    return mockArticles.find((a) => a.id === parseInt(id, 10)) ?? null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.publishedAt,
      images: [
        {
          url: `/article/${id}/opengraph-image`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
    },
  };
}

const BIAS_LABELS: Record<string, string> = {
  "far-left": "Far Left",
  left: "Left-Leaning",
  center: "Center",
  right: "Right-Leaning",
  "far-right": "Far Right",
};

const BIAS_BG: Record<string, string> = {
  "far-left": "bg-bias-far-left",
  left: "bg-bias-left",
  center: "bg-bias-center",
  right: "bg-bias-right",
  "far-right": "bg-bias-far-right",
};

const SUB_BG: Record<string, string> = {
  AI: "bg-sub-ai",
  VC: "bg-sub-vc",
  Research: "bg-sub-research",
  Startup: "bg-sub-startup",
  Product: "bg-sub-product",
  Security: "bg-sub-security",
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) notFound();

  const badgeBase =
    "font-ui text-[0.6rem] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-[2px] text-white";

  return (
    <div className="min-h-screen bg-paper text-ink font-body leading-[1.65]">
      <div className="max-w-[720px] mx-auto px-[clamp(1.25rem,4vw,3rem)] py-16">
        {/* Back link */}
        <Link
          href="/"
          className="font-ui text-[0.6rem] tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors mb-10 inline-block"
        >
          ← The Dollar Digest
        </Link>

        <div className="h-0.5 bg-ink mb-8" />

        {/* Badge */}
        <div className="flex items-center gap-3 mb-6">
          {article.category === "tech" && article.subcategory && (
            <span
              className={`${badgeBase} ${SUB_BG[article.subcategory] ?? "bg-sub-product"}`}
            >
              {article.subcategory}
            </span>
          )}
          {article.category === "politics" && article.bias && (
            <span className={`${badgeBase} ${BIAS_BG[article.bias]}`}>
              {BIAS_LABELS[article.bias]}
            </span>
          )}
          {article.readingTimeMinutes && (
            <span className="font-ui text-[0.6rem] text-ink-faint tracking-[0.06em]">
              {article.readingTimeMinutes} min read
            </span>
          )}
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold text-[clamp(1.875rem,4vw,2.75rem)] leading-[1.12] tracking-[-0.02em] text-ink mb-6">
          {article.title}
        </h1>

        <div className="flex items-center gap-2 font-ui text-[0.6rem] tracking-[0.08em] uppercase text-ink-faint mb-10">
          <span className="text-ink-muted font-bold">{article.source}</span>
          <span>·</span>
          <span>
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="h-px bg-rule mb-10" />

        {/* Summary */}
        <p className="font-body text-ink-mid text-[1.0625rem] leading-[1.8]">
          {article.summary}
        </p>

        {/* Read original */}
        {article.sourceUrl && (
          <div className="mt-12 pt-8 border-t border-rule">
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-ui text-[0.6875rem] tracking-[0.08em] uppercase text-gold border border-gold px-5 py-2.5 hover:bg-gold hover:text-white transition-colors duration-150 inline-block"
            >
              Read full article at {article.source} →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
