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
    .sort((a, b) => (b.importanceScore ?? 0) - (a.importanceScore ?? 0));

  const [feature, second, third, ...rest] = sorted;
  const bottom = rest.slice(0, 3);

  if (!feature) return null;

  return (
    <section>
      <div className="section-header">
        <span className="section-label">{label}</span>
        <div className="section-rule" />
      </div>

      <div className="digest-section">
        <div className="digest-grid">
          <div className="grid-feature">
            <ArticleCard article={feature} size="featured" />
          </div>

          <div className="grid-sidebar">
            {second && (
              <div className="grid-sidebar-item">
                <ArticleCard article={second} size="mid" />
              </div>
            )}
            {third && (
              <div className="grid-sidebar-item">
                <ArticleCard article={third} size="mid" />
              </div>
            )}
          </div>
        </div>

        {bottom.length > 0 && (
          <div className="grid-bottom">
            {bottom.map((article) => (
              <div key={article.id} className="grid-bottom-item">
                <ArticleCard article={article} size="small" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
