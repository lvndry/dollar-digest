import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/schema";

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

export function FeaturedArticleCard({ article }: { article: Article }) {
  const isPolitics = article.category === "politics";

  const tagColor = isPolitics
    ? article.bias
      ? BIAS_COLOR[article.bias]
      : "var(--ink-muted)"
    : article.subcategory
      ? (SUB_COLOR[article.subcategory] ?? "var(--color-sub-product)")
      : "var(--ink-muted)";

  const tagLabel = isPolitics
    ? article.bias
      ? BIAS_LABELS[article.bias]
      : null
    : (article.subcategory ?? null);

  const publishedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <article className="article-card mb-10 fade-up" style={{ animationDelay: "0ms" }}>
      {/* Panoramic hero image with overlaid title */}
      <Link href={`/article/${article.id}`} className="block relative overflow-hidden">
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              priority
              sizes="100vw"
              quality={85}
              className="object-cover card-image"
            />
          ) : (
            <div
              className="absolute inset-0 card-image"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${tagColor} 20%, var(--surface)), color-mix(in srgb, ${tagColor} 6%, var(--surface)))`,
              }}
            />
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
            }}
          />

          {/* Overlaid content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            {tagLabel && (
              <span
                className="font-ui text-[0.6rem] tracking-[0.14em] uppercase block mb-3"
                style={{ color: tagColor }}
              >
                {tagLabel}
              </span>
            )}
            <h2
              className="article-title-overlay font-display italic leading-[1.1]"
              style={{
                color: "#f0ebe2",
                fontSize: "clamp(1.375rem, 3vw, 2.125rem)",
                letterSpacing: "-0.02em",
              }}
            >
              {article.title}
            </h2>
          </div>
        </div>
      </Link>

      {/* Summary + metadata row */}
      <div className="pt-4 pb-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <p
          className="font-body text-[0.875rem] leading-[1.7] line-clamp-2 flex-1 max-w-2xl"
          style={{ color: "var(--ink-mid)" }}
        >
          {article.summary}
        </p>
        <footer className="flex items-center gap-2 font-ui text-[0.575rem] tracking-[0.06em] uppercase shrink-0 pt-1">
          <span style={{ color: "var(--ink-mid)", fontWeight: 500 }}>
            {article.source}
          </span>
          <span style={{ color: "var(--ink-faint)" }}>·</span>
          <span style={{ color: "var(--ink-muted)" }}>{publishedDate}</span>
          {article.readingTimeMinutes != null && (
            <>
              <span style={{ color: "var(--ink-faint)" }}>·</span>
              <span style={{ color: "var(--ink-muted)" }}>
                {article.readingTimeMinutes} min
              </span>
            </>
          )}
        </footer>
      </div>
    </article>
  );
}
