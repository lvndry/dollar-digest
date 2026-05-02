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
  const secondary = [second, third].filter((a): a is Article => a !== undefined);
  const bottom = rest.slice(0, 3);

  if (!feature) return null;

  return (
    <section className="mb-20">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-10">
        <span
          className="font-ui text-[0.6rem] tracking-[0.16em] uppercase shrink-0"
          style={{ color: "var(--ink-muted)" }}
        >
          {label}
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
      </div>

      {/* Featured + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div
          className="lg:col-span-7 pb-12 lg:pb-0 lg:pr-12 border-b lg:border-b-0 lg:border-r mb-12 lg:mb-0"
          style={{ borderColor: "var(--border)" }}
        >
          <ArticleCard article={feature} size="featured" index={0} />
        </div>

        <div className="lg:col-span-5 lg:pl-12 flex flex-col gap-9">
          {secondary.map((article, idx) => (
            <div
              key={article.id}
              className={idx < secondary.length - 1 ? "pb-9 border-b" : ""}
              style={{ borderColor: "var(--border)" }}
            >
              <ArticleCard article={article} size="mid" index={idx + 1} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      {bottom.length > 0 && (
        <div
          className="grid grid-cols-1 md:grid-cols-3 border-t mt-12 pt-12"
          style={{ borderColor: "var(--border)" }}
        >
          {bottom.map((article, idx) => (
            <div
              key={article.id}
              className={[
                idx < bottom.length - 1
                  ? "border-b md:border-b-0 md:border-r md:pr-10"
                  : "",
                idx > 0 ? "pt-9 md:pt-0 md:pl-10" : "",
                idx < bottom.length - 1 ? "pb-9 md:pb-0" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ borderColor: "var(--border)" }}
            >
              <ArticleCard article={article} size="small" index={idx + 3} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
