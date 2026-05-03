import type { Article } from "@/lib/schema";
import { ArticleCard } from "./ArticleCard";
import { FeaturedArticleCard } from "./FeaturedArticleCard";

interface DigestGridProps {
  articles: Article[];
  category: "tech" | "politics";
  label: string;
  articleLimit?: number;
}

export function DigestGrid({ articles, category, label, articleLimit }: DigestGridProps) {
  const sorted = [...articles]
    .filter((a) => a.category === category)
    .sort((a, b) => (b.importanceScore ?? 0) - (a.importanceScore ?? 0));
  const capped =
    articleLimit != null && articleLimit >= 0 ? sorted.slice(0, articleLimit) : sorted;

  if (capped.length === 0) return null;

  const [featured, ...rest] = capped;

  return (
    <section className="mb-28">
      {/* Section title */}
      <div className="mb-8">
        <h2
          className="font-display italic fade-in"
          style={{
            color: "var(--ink)",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            letterSpacing: "-0.025em",
            lineHeight: "1",
          }}
        >
          {label}
        </h2>
        <div className="mt-4 h-px" style={{ backgroundColor: "var(--border)" }} />
      </div>

      {/* Featured lead article */}
      {featured && <FeaturedArticleCard article={featured} />}

      {/* Secondary articles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">
        {rest.map((article, idx) => (
          <ArticleCard key={article.id} article={article} index={idx + 1} />
        ))}
      </div>
    </section>
  );
}
