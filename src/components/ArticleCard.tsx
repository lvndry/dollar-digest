import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/schema";
import {
  formatArticleSourceLabel,
  parseArticleSources,
  parseJsonStringArray,
} from "@/lib/parse-article-metadata";

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

interface ArticleCardProps {
  article: Article;
  index?: number;
}

export function ArticleCard({ article, index = 0 }: ArticleCardProps) {
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

  const regionLabels = isPolitics ? parseJsonStringArray(article.regions) : [];
  const deskRegion =
    isPolitics && (article.primaryRegion?.trim() || regionLabels[0])
      ? (article.primaryRegion?.trim() ?? regionLabels[0])
      : null;
  const articleSources = parseArticleSources(article.sources, {
    name: article.source,
    bias: article.bias,
  });
  const sourceLabel = formatArticleSourceLabel(articleSources, article.source);

  return (
    <article
      className="article-card flex min-w-0 w-full flex-col fade-up"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {/* Image */}
      <Link
        href={`/article/${article.id}`}
        className="block overflow-hidden mb-3"
        tabIndex={-1}
        aria-hidden
      >
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: "3/2",
            backgroundColor: `color-mix(in srgb, ${tagColor} 8%, var(--surface))`,
          }}
        >
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={80}
              className="object-cover card-image"
            />
          ) : (
            <div
              className="absolute inset-0 card-image"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${tagColor} 18%, var(--surface)), color-mix(in srgb, ${tagColor} 5%, var(--surface)))`,
              }}
            />
          )}
        </div>
      </Link>

      {/* Bias + primary region (politics desk lens) */}
      {(tagLabel || deskRegion) && (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-2">
          {tagLabel && (
            <span
              className="font-ui text-[0.575rem] tracking-[0.12em] uppercase"
              style={{ color: tagColor }}
            >
              {tagLabel}
            </span>
          )}
          {deskRegion && (
            <>
              {tagLabel && (
                <span
                  className="font-ui text-[0.575rem]"
                  style={{ color: "var(--ink-faint)" }}
                >
                  ·
                </span>
              )}
              <span
                className="font-ui text-[0.575rem] tracking-widest uppercase"
                style={{ color: "var(--ink-muted)" }}
              >
                {deskRegion}
              </span>
            </>
          )}
        </div>
      )}

      {/* Title */}
      <Link
        href={`/article/${article.id}`}
        className="article-title block min-w-0 break-words font-display italic leading-[1.2] mb-3 flex-1"
        style={{
          color: "var(--ink)",
          fontSize: "clamp(1rem, 1.5vw, 1.0625rem)",
          letterSpacing: "-0.01em",
        }}
      >
        {article.title}
      </Link>

      {/* Footer */}
      <footer className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-ui text-[0.575rem] tracking-[0.06em] uppercase">
        <span
          className="min-w-0 break-words"
          style={{ color: "var(--ink-mid)", fontWeight: 500 }}
        >
          {sourceLabel}
        </span>
        <span style={{ color: "var(--ink-faint)" }}>·</span>
        <span style={{ color: "var(--ink-muted)" }}>
          {new Date(article.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        {article.readingTimeMinutes != null && (
          <>
            <span style={{ color: "var(--ink-faint)" }}>·</span>
            <span style={{ color: "var(--ink-muted)" }}>
              {article.readingTimeMinutes} min
            </span>
          </>
        )}
      </footer>
    </article>
  );
}
