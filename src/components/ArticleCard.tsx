import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/schema";

type Size = "featured" | "mid" | "small";

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

const TITLE_SIZE: Record<Size, string> = {
  featured: "text-[clamp(1.625rem,3.5vw,2.5rem)] leading-[1.1]",
  mid: "text-[clamp(1.1rem,2vw,1.375rem)] leading-[1.18]",
  small: "text-[1rem] leading-[1.22]",
};

interface ArticleCardProps {
  article: Article;
  size?: Size;
  index?: number;
}

export function ArticleCard({ article, size = "small", index = 0 }: ArticleCardProps) {
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

  return (
    <article
      className="article-card relative pl-4 fade-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="card-accent" />

      {/* Image — featured and mid only */}
      {article.imageUrl && size !== "small" && (
        <div
          className={[
            "overflow-hidden mb-5",
            size === "featured" ? "w-full aspect-[16/9]" : "w-full aspect-[3/2]",
          ].join(" ")}
        >
          <Image
            src={article.imageUrl}
            alt={article.title}
            width={size === "featured" ? 960 : 480}
            height={size === "featured" ? 540 : 320}
            className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.025]"
            loading="lazy"
          />
        </div>
      )}

      {/* Tag row */}
      <div className="flex items-center gap-3 mb-2.5">
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
            {article.readingTimeMinutes} min
          </span>
        )}
      </div>

      {/* Title */}
      <Link
        href={`/article/${article.id}`}
        className={`article-title block font-display italic mb-2.5 ${TITLE_SIZE[size]}`}
        style={{ color: "var(--ink)" }}
      >
        {article.title}
      </Link>

      {/* Summary */}
      <p
        className={[
          "font-body mb-4",
          size === "featured"
            ? "text-[0.9375rem] leading-[1.78]"
            : "text-[0.875rem] leading-[1.65] line-clamp-3",
        ].join(" ")}
        style={{ color: "var(--ink-mid)" }}
      >
        {article.summary}
      </p>

      {/* Footer */}
      <footer className="flex items-center gap-2 font-ui text-[0.575rem] tracking-[0.06em] uppercase">
        <span style={{ color: "var(--ink-mid)", fontWeight: 500 }}>{article.source}</span>
        <span style={{ color: "var(--border-strong)" }}>·</span>
        <span style={{ color: "var(--ink-muted)" }}>
          {new Date(article.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </footer>
    </article>
  );
}
