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

  const num = String(index + 1).padStart(2, "0");

  return (
    <article
      className="article-card relative flex flex-col border-t pb-8 pt-5 fade-up"
      style={{ borderColor: "var(--border)", animationDelay: `${index * 60}ms` }}
    >
      <div className="card-sweep" />

      {/* Number + tag row */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="font-ui text-[0.625rem] tracking-[0.04em]"
          style={{ color: "var(--ink-faint)" }}
        >
          {num}
        </span>
        {tagLabel && (
          <span
            className="font-ui text-[0.575rem] tracking-[0.1em] uppercase px-2 py-0.5 rounded-[2px] text-white"
            style={{ backgroundColor: tagColor }}
          >
            {tagLabel}
          </span>
        )}
      </div>

      {/* Image */}
      <Link
        href={`/article/${article.id}`}
        className="block mb-4 overflow-hidden rounded-[3px]"
        tabIndex={-1}
        aria-hidden
      >
        <div
          className="relative w-full"
          style={{
            aspectRatio: "16/9",
            backgroundColor: tagColor
              ? `color-mix(in srgb, ${tagColor} 10%, var(--border))`
              : "var(--border)",
          }}
        >
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              style={{ transition: "transform 0.5s ease" }}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-end p-3"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${tagColor} 15%, transparent), color-mix(in srgb, ${tagColor} 5%, transparent))`,
              }}
            >
              <span
                className="font-display italic text-[1.75rem] leading-none opacity-20"
                style={{ color: tagColor ?? "var(--ink)" }}
              >
                {num}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Title */}
      <Link
        href={`/article/${article.id}`}
        className="article-title block font-display italic text-[1.0625rem] leading-[1.22] mb-3 flex-1"
        style={{ color: "var(--ink)" }}
      >
        {article.title}
      </Link>

      {/* Summary */}
      <p
        className="font-body text-[0.8125rem] leading-[1.65] mb-5 line-clamp-3"
        style={{ color: "var(--ink-mid)" }}
      >
        {article.summary}
      </p>

      {/* Footer */}
      <footer className="flex items-center gap-2 font-ui text-[0.575rem] tracking-[0.06em] uppercase mt-auto">
        <span style={{ color: "var(--ink-mid)", fontWeight: 500 }}>{article.source}</span>
        <span style={{ color: "var(--border-strong)" }}>·</span>
        <span style={{ color: "var(--ink-muted)" }}>
          {new Date(article.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        {article.readingTimeMinutes != null && (
          <>
            <span style={{ color: "var(--border-strong)" }}>·</span>
            <span style={{ color: "var(--ink-muted)" }}>
              {article.readingTimeMinutes} min
            </span>
          </>
        )}
      </footer>
    </article>
  );
}
