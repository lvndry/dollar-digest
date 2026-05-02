import type { Article } from "@/lib/schema";

type Size = "featured" | "mid" | "small";

const BIAS_LABELS: Record<string, string> = {
  "far-left": "Far Left",
  left: "Left-Leaning",
  center: "Center",
  right: "Right-Leaning",
  "far-right": "Far Right",
};

const BADGE_CLASS: Record<string, string> = {
  AI: "badge-ai",
  VC: "badge-vc",
  Research: "badge-research",
  Startup: "badge-startup",
  Product: "badge-product",
  Security: "badge-security",
};

interface ArticleCardProps {
  article: Article;
  size?: Size;
}

export function ArticleCard({ article, size = "small" }: ArticleCardProps) {
  const isPolitics = article.category === "politics";
  const titleClass = `card-title card-title-${size === "featured" ? "featured" : size === "mid" ? "mid" : "small"}`;
  const summaryClass = `card-summary card-summary-${size === "featured" ? "featured" : "small"}`;

  return (
    <article
      className={isPolitics ? "card card-politics" : "card"}
      data-bias={article.bias ?? undefined}
    >
      <div className="card-badge-row">
        {article.category === "tech" && article.subcategory && (
          <span
            className={`card-badge ${BADGE_CLASS[article.subcategory] ?? "badge-product"}`}
          >
            {article.subcategory}
          </span>
        )}
        {isPolitics && article.bias && (
          <span className="bias-label">{BIAS_LABELS[article.bias]}</span>
        )}
        {article.readingTimeMinutes && (
          <span className="card-reading-time">{article.readingTimeMinutes} min read</span>
        )}
      </div>

      <a
        href={article.sourceUrl ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={titleClass}
      >
        {article.title}
      </a>

      <p className={summaryClass}>{article.summary}</p>

      <footer className="card-footer">
        <span className="card-source">{article.source}</span>
        <span className="card-dot">·</span>
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
