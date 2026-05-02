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
      {/* Section header */}
      <div className="max-w-[1320px] mx-auto mb-6 px-[clamp(1.25rem,4vw,3rem)] flex items-center gap-4">
        <span className="font-ui text-[0.6875rem] font-bold tracking-[0.14em] uppercase text-ink-muted whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 h-px bg-rule" />
      </div>

      <div className="max-w-[1320px] mx-auto mb-16 px-[clamp(1.25rem,4vw,3rem)]">
        {/* Main row: feature + sidebar */}
        <div className="grid grid-cols-12 gap-0">
          {/* Feature */}
          <div className="col-span-12 lg:col-span-7 lg:pr-10 lg:border-r lg:border-rule pb-8 lg:pb-0 border-b lg:border-b-0 border-rule mb-8 lg:mb-0">
            <ArticleCard article={feature} size="featured" />
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-5 flex flex-col">
            {second && (
              <div className="lg:pl-8 pb-6 border-b border-rule mb-6">
                <ArticleCard article={second} size="mid" />
              </div>
            )}
            {third && (
              <div className="lg:pl-8">
                <ArticleCard article={third} size="mid" />
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        {bottom.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-rule mt-8 pt-8">
            {bottom.map((article, index) => (
              <div
                key={article.id}
                className={[
                  index < bottom.length - 1
                    ? "border-b md:border-b-0 md:border-r border-rule"
                    : "",
                  index > 0 ? "md:pl-8" : "",
                  index < bottom.length - 1 ? "pb-6 md:pb-0 md:pr-8 mb-6 md:mb-0" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <ArticleCard article={article} size="small" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
