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

const BIAS_BORDER: Record<string, string> = {
  "far-left": "border-l-bias-far-left",
  left: "border-l-bias-left",
  center: "border-l-bias-center",
  right: "border-l-bias-right",
  "far-right": "border-l-bias-far-right",
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

const TITLE_SIZE: Record<Size, string> = {
  featured: "text-[clamp(1.625rem,3vw,2.375rem)] leading-[1.18] mb-4",
  mid: "text-[clamp(1.125rem,2vw,1.5rem)] leading-[1.2] mb-3",
  small: "text-[1.0625rem] leading-[1.2] mb-2.5",
};

const SUMMARY_SIZE: Record<Size, string> = {
  featured: "text-base",
  mid: "text-[0.9rem]",
  small: "text-[0.9rem]",
};

interface ArticleCardProps {
  article: Article;
  size?: Size;
}

export function ArticleCard({ article, size = "small" }: ArticleCardProps) {
  const isPolitics = article.category === "politics";

  const containerClass = isPolitics
    ? `border-l-[3px] pl-4 ${article.bias ? BIAS_BORDER[article.bias] : "border-l-rule"}`
    : "";

  const badgeBase =
    "font-ui text-[0.6rem] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-[2px] text-white";

  return (
    <article className={containerClass}>
      <div className="flex items-center justify-between mb-3">
        <div>
          {article.category === "tech" && article.subcategory && (
            <span
              className={`${badgeBase} ${SUB_BG[article.subcategory] ?? "bg-sub-product"}`}
            >
              {article.subcategory}
            </span>
          )}
          {isPolitics && article.bias && (
            <span className={`${badgeBase} ${BIAS_BG[article.bias]}`}>
              {BIAS_LABELS[article.bias]}
            </span>
          )}
        </div>
        {article.readingTimeMinutes && (
          <span className="font-ui text-[0.6rem] text-ink-faint tracking-[0.06em]">
            {article.readingTimeMinutes} min read
          </span>
        )}
      </div>

      <Link
        href={`/article/${article.id}`}
        className={`title-link block font-display font-bold tracking-[-0.015em] ${TITLE_SIZE[size]}`}
      >
        {article.title}
      </Link>

      <p className={`font-body text-ink-mid leading-[1.7] mb-4 ${SUMMARY_SIZE[size]}`}>
        {article.summary}
      </p>

      <footer className="flex items-center gap-2 font-ui text-[0.6rem] tracking-[0.08em] uppercase text-ink-faint">
        <span className="text-ink-muted font-bold">{article.source}</span>
        <span className="text-rule-strong">·</span>
        <span>
          {new Date(article.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </footer>
    </article>
  );
}
