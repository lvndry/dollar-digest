import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Article } from "@/lib/schema";
import { SiteNav } from "@/components/SiteNav";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ArchivePaywall } from "@/components/ArchivePaywall";
import { auth } from "@/auth";
import { canAccessDigestDate } from "@/lib/access";

function parseTagColumn(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsedTags = JSON.parse(raw) as unknown;
    return Array.isArray(parsedTags)
      ? parsedTags.filter((tag): tag is string => typeof tag === "string")
      : [];
  } catch {
    return [];
  }
}

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
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) return { title: "Article Not Found", robots: { index: false } };

  const session = await auth();
  if (!canAccessDigestDate(article.digestDate, session)) {
    return {
      title: "Premium archive article",
      description: "Subscribe to The One Dollar Digest to read archived articles.",
      robots: { index: false },
    };
  }

  const images = [
    {
      url: `/article/${id}/opengraph-image`,
      width: 1200,
      height: 630,
      alt: article.title,
    },
  ];

  return {
    title: article.title,
    description: article.summary.slice(0, 160),
    alternates: { canonical: `/article/${id}` },
    openGraph: {
      title: article.title,
      description: article.summary.slice(0, 160),
      type: "article",
      publishedTime: article.publishedAt,
      section: getArticleSection(article),
      authors: [article.source],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary.slice(0, 160),
      images,
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

function getArticleSection(article: Article): string {
  if (article.category === "politics") return "Politics";
  return article.subcategory ?? "Technology";
}

function getTagColor(article: Article): string | undefined {
  if (article.category === "politics") {
    return article.bias ? BIAS_COLOR[article.bias] : "var(--ink-muted)";
  }

  if (article.subcategory) {
    return SUB_COLOR[article.subcategory] ?? "var(--color-sub-product)";
  }

  return "var(--ink-muted)";
}

function getTagLabel(article: Article): string | null {
  if (article.category === "politics") {
    return article.bias ? (BIAS_LABELS[article.bias] ?? null) : null;
  }

  return article.subcategory ?? null;
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) notFound();

  const session = await auth();

  if (!canAccessDigestDate(article.digestDate, session)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--bg)",
          color: "var(--ink)",
        }}
      >
        <SiteNav />
        <div className="max-w-[680px] mx-auto px-6 pt-14">
          <Link
            href="/"
            className="font-ui text-[0.6rem] tracking-[0.1em] uppercase transition-colors duration-150 inline-block mb-14"
            style={{ color: "var(--ink-muted)" }}
          >
            ← Today's Digest
          </Link>
        </div>
        <ArchivePaywall isSignedIn={!!session?.user} />
      </div>
    );
  }

  const tagColor = getTagColor(article);
  const tagLabel = getTagLabel(article);

  const articleTags = parseTagColumn(article.tags);
  const articleRegions =
    article.category === "politics" ? parseTagColumn(article.regions) : [];

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.onedollardigest.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary.slice(0, 160),
    datePublished: article.publishedAt,
    author: { "@type": "Organization", name: article.source },
    publisher: {
      "@type": "Organization",
      name: "The One Dollar Digest",
      logo: { "@type": "ImageObject", url: `${base}/android-chrome-512x512.png` },
    },
    url: `${base}/article/${id}`,
    ...(article.imageUrl ? { image: article.imageUrl } : {}),
    ...(article.sourceUrl ? { mainEntityOfPage: article.sourceUrl } : {}),
    articleSection: getArticleSection(article),
    isAccessibleForFree: true,
  };

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--ink)" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />
      <SiteNav />

      <article className="max-w-[680px] mx-auto px-6 pt-14 pb-24">
        <Link
          href="/"
          className="font-ui text-[0.6rem] tracking-[0.1em] uppercase transition-colors duration-150 inline-block mb-14"
          style={{ color: "var(--ink-muted)" }}
        >
          ← Today's Digest
        </Link>

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

        <h1
          className="font-display italic text-[clamp(2rem,5vw,3.25rem)] leading-[1.06] tracking-[-0.02em] mb-7"
          style={{ color: "var(--ink)" }}
        >
          {article.title}
        </h1>

        {articleTags.length > 0 && (
          <p
            className="font-ui text-[0.65rem] leading-relaxed tracking-wider mb-7 -mt-4"
            style={{ color: "var(--ink-muted)" }}
          >
            <span className="text-(--ink-faint) uppercase tracking-widest">Tags</span>{" "}
            {articleTags.join(" · ")}
          </p>
        )}

        {articleRegions.length > 0 && (
          <p
            className="font-ui text-[0.65rem] leading-relaxed tracking-wider mb-7 -mt-4"
            style={{ color: "var(--ink-muted)" }}
          >
            <span className="text-(--ink-faint) uppercase tracking-widest">Regions</span>{" "}
            {articleRegions.join(" · ")}
          </p>
        )}

        <div
          className="flex items-center gap-2 font-ui text-[0.6rem] tracking-[0.08em] uppercase mb-10"
          style={{ color: "var(--ink-muted)" }}
        >
          <span style={{ color: "var(--ink-mid)", fontWeight: 500 }}>
            {article.source}
          </span>
          <span style={{ color: "var(--border-strong)" }}>·</span>
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>

        <div className="h-px mb-10" style={{ backgroundColor: "var(--border)" }} />

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

        <p
          className="font-body text-[1.0625rem] leading-[1.9]"
          style={{ color: "var(--ink-mid)" }}
        >
          {article.summary}
        </p>

        {article.category === "politics" && article.strategicInterpretation && (
          <section
            className="mt-10 border-l pl-5"
            style={{ borderColor: "var(--border-strong)" }}
          >
            <h2
              className="font-ui text-[0.65rem] tracking-widest uppercase mb-3"
              style={{ color: "var(--ink-faint)" }}
            >
              Strategic interpretation
            </h2>
            <p
              className="font-body text-[0.98rem] leading-[1.8]"
              style={{ color: "var(--ink-mid)" }}
            >
              {article.strategicInterpretation}
            </p>
          </section>
        )}

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
