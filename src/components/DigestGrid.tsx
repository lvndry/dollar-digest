import type { Article } from "@/lib/schema";
import { ArticleCard } from "./ArticleCard";

interface DigestGridProps {
  articles: Article[];
  category: "tech" | "politics";
  label: string;
}

export function DigestGrid({ articles, category, label }: DigestGridProps) {
  const sorted = [...articles]
    .filter((a) => a.category === category)
    .sort((a, b) => (b.importanceScore ?? 0) - (a.importanceScore ?? 0))
    .slice(0, 8);

  if (sorted.length === 0) return null;

  return (
    <section className="mb-20">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-2">
        <span
          className="font-ui text-[0.6rem] tracking-[0.16em] uppercase shrink-0"
          style={{ color: "var(--ink-muted)" }}
        >
          {label}
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
      </div>

      {/* Numbered card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
        {sorted.map((article, idx) => (
          <ArticleCard key={article.id} article={article} index={idx} />
        ))}
      </div>
    </section>
  );
}
