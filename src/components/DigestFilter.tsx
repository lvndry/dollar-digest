"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Article } from "@/lib/schema";
import { parseJsonStringArray } from "@/lib/parse-article-metadata";
import { DigestGrid } from "./DigestGrid";

type FilterBy = "region" | "subcategory";

interface DigestFilterProps {
  articles: Article[];
  category: "tech" | "politics";
  label: string;
  filterBy: FilterBy;
  filterOptions: string[];
}

export function DigestFilter({
  articles,
  category,
  label,
  filterBy,
  filterOptions,
}: DigestFilterProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!selected) return articles;
    return articles.filter((a) => {
      if (a.category !== category) return false;
      if (filterBy === "region") {
        return (
          a.primaryRegion?.trim() === selected ||
          parseJsonStringArray(a.regions).some((r) => r.trim() === selected)
        );
      }
      return a.subcategory?.trim() === selected;
    });
  }, [articles, category, selected, filterBy]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  if (filterOptions.length === 0) {
    return <DigestGrid articles={articles} category={category} label={label} />;
  }

  const allOptions: (string | null)[] = [null, ...filterOptions];

  return (
    <div>
      <div ref={containerRef} className="mb-10">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="w-full flex items-center justify-between py-2.5"
          style={{
            borderBottom: `1px solid ${open ? "var(--ink)" : "var(--border)"}`,
            transition: "border-color 0.2s ease",
          }}
        >
          <span
            className="font-ui text-[0.525rem] tracking-[0.2em] uppercase"
            style={{
              color: selected ? "var(--accent)" : "var(--ink-muted)",
              transition: "color 0.2s ease",
            }}
          >
            {selected ? `Filter by · ${selected}` : "Filter by"}
          </span>
          <span
            className="font-ui text-[0.45rem]"
            style={{
              color: "var(--ink-faint)",
              display: "inline-block",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            ▾
          </span>
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateRows: open ? "1fr" : "0fr",
            transition: "grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <div
              className="pt-3 pb-3 flex flex-wrap gap-x-6 gap-y-2.5"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              {allOptions.map((option) => {
                const isSelected = selected === option;
                const optionLabel = option ?? "All";
                return (
                  <button
                    key={optionLabel}
                    onClick={() =>
                      setSelected((prev) => (prev === option ? null : option))
                    }
                    className="flex items-center gap-1.5 font-ui text-[0.525rem] tracking-[0.18em] uppercase"
                    style={{
                      color: isSelected ? "var(--ink)" : "var(--ink-muted)",
                      transition: "color 0.15s ease",
                    }}
                  >
                    <span
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{
                        backgroundColor: isSelected ? "var(--accent)" : "transparent",
                        border: `1px solid ${isSelected ? "var(--accent)" : "var(--ink-faint)"}`,
                        transition:
                          "background-color 0.15s ease, border-color 0.15s ease",
                      }}
                    />
                    {optionLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <DigestGrid articles={filtered} category={category} label={label} />
    </div>
  );
}
