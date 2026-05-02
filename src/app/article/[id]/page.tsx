import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Article } from "@/lib/schema";
import { SiteNav } from "@/components/SiteNav";
import { ReadingProgress } from "@/components/ReadingProgress";

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
      images: [{ url: `/article/${id}/opengraph-image`, width: 1200, height: 630 }],
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

const BIAS_COLOR: Record<string, string> = {
  "far-left": "var(--color-bias-far-left)",
  left: "var(--color-bias-left)",
  center: "var(--color-bias-center)",
  right: "var(--color-bias-right)",
  "far-right": "var(--color-bias-far-right)",
};

const SUB_COLOR: Record<string, string> = {
  AI: "var(--color-sub-ai)",
  VC: "var(--color-sub-vc)",
  Research: "var(--color-sub-research)",
  Startup: "var(--color-sub-startup)",
  Product: "var(--color-sub-product)",
  Security: "var(--color-sub-security)",
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) notFound();

  const tagColor =
    article.category === "politics"
      ? article.bias
        ? BIAS_COLOR[article.bias]
        : "var(--ink-muted)"
      : article.subcategory
        ? (SUB_COLOR[article.subcategory] ?? "var(--color-sub-product)")
        : "var(--ink-muted)";

  const tagLabel =
    article.category === "politics"
      ? article.bias
        ? BIAS_LABELS[article.bias]
        : null
      : (article.subcategory ?? null);

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--ink)" }}
    >
      <ReadingProgress />
      <SiteNav />

      <article className="max-w-[680px] mx-auto px-6 pt-14 pb-24">
        {/* Back link */}
        <Link
          href="/"
          className="font-ui text-[0.6rem] tracking-[0.1em] uppercase transition-colors duration-150 inline-block mb-14"
          style={{ color: "var(--ink-muted)" }}
        >
          ← Today&apos;s Digest
        </Link>

        {/* Tag + reading time */}
        <div className="flex items-center gap-3 mb-5">
          {tagLabel && (
            <span
              className="font-ui text-[0.575rem] tracking-[0.1em] uppercase px-2 py-0.5 rounded-[2px] text-white"
              style={{ backgroundColor: tagColor }}
            >
              {tagLabel}
            </span>
          )}
          {article.readingTimeMinutes != null && (
            <span
              className="font-ui text-[0.575rem] tracking-[0.06em]"
              style={{ color: "var(--ink-faint)" }}
            >
              {article.readingTimeMinutes} min read
            </span>
          )}
        </div>

        {/* Headline */}
        <h1
          className="font-display italic text-[clamp(2rem,5vw,3.25rem)] leading-[1.06] tracking-[-0.02em] mb-7"
          style={{ color: "var(--ink)" }}
        >
          {article.title}
        </h1>

        {/* Meta */}
        <div
          className="flex items-center gap-2 font-ui text-[0.6rem] tracking-[0.08em] uppercase mb-10"
          style={{ color: "var(--ink-muted)" }}
        >
          <span style={{ color: "var(--ink-mid)", fontWeight: 500 }}>
            {article.source}
          </span>
          <span style={{ color: "var(--border-strong)" }}>·</span>
          <span>
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="h-px mb-10" style={{ backgroundColor: "var(--border)" }} />

        {/* Image */}
        {article.imageUrl && (
          <div className="w-full aspect-[16/9] overflow-hidden mb-10">
            <Image
              src={article.imageUrl}
              alt={article.title}
              width={1360}
              height={765}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        {/* Summary */}
        <p
          className="font-body text-[1.0625rem] leading-[1.9]"
          style={{ color: "var(--ink-mid)" }}
        >
          {article.summary}
        </p>

        {/* Read original */}
        {article.sourceUrl && (
          <div className="mt-14 pt-10 border-t" style={{ borderColor: "var(--border)" }}>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent font-ui text-[0.6875rem] tracking-[0.08em] uppercase px-5 py-3 border inline-block"
            >
              Read full article at {article.source} →
            </a>
          </div>
        )}
      </article>
    </div>
  );
}
