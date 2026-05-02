"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface DateCalendarProps {
  availableDates: string[];
  selectedDate: string;
}

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function isoToLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

export function DateCalendar({ availableDates, selectedDate }: DateCalendarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const selectedLocal = isoToLocal(selectedDate);
  const [viewYear, setViewYear] = useState(selectedLocal.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedLocal.getMonth());

  const availableSet = new Set(availableDates);
  const today = new Date().toISOString().split("T")[0]!;

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    const now = new Date();
    if (
      viewYear > now.getFullYear() ||
      (viewYear === now.getFullYear() && viewMonth >= now.getMonth())
    )
      return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function selectDate(dateStr: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (dateStr === today) {
      params.delete("date");
    } else {
      params.set("date", dateStr);
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
    setOpen(false);
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1);
  // Monday-indexed: 0=Mon … 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isAtFuture = (() => {
    const now = new Date();
    return (
      viewYear > now.getFullYear() ||
      (viewYear === now.getFullYear() && viewMonth >= now.getMonth())
    );
  })();

  return (
    <div className="mt-6">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 mx-auto font-ui text-[0.6rem] tracking-[0.12em] uppercase cursor-pointer"
        style={{ color: "var(--ink-muted)" }}
      >
        <span
          style={{
            display: "inline-block",
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
        {open ? "collapse archive" : "browse archive"}
      </button>

      {/* Calendar panel */}
      <div
        style={{
          maxHeight: open ? "320px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          className="mt-4 mx-auto"
          style={{
            maxWidth: "280px",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "16px",
            backgroundColor: "var(--surface)",
          }}
        >
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="font-ui text-[0.6rem] tracking-wider cursor-pointer"
              style={{ color: "var(--ink-muted)" }}
            >
              ←
            </button>
            <span
              className="font-ui text-[0.6rem] tracking-[0.12em] uppercase"
              style={{ color: "var(--ink)" }}
            >
              {monthLabel}
            </span>
            <button
              onClick={nextMonth}
              className="font-ui text-[0.6rem] tracking-wider cursor-pointer"
              style={{
                color: isAtFuture ? "var(--ink-faint)" : "var(--ink-muted)",
                pointerEvents: isAtFuture ? "none" : "auto",
              }}
            >
              →
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center font-ui"
                style={{
                  fontSize: "0.5rem",
                  letterSpacing: "0.08em",
                  color: "var(--ink-faint)",
                  paddingBottom: "4px",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} />;
              }
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const hasArticles = availableSet.has(dateStr);
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === today;
              const isFuture = dateStr > today;

              return (
                <button
                  key={dateStr}
                  disabled={!hasArticles || isFuture}
                  onClick={() => hasArticles && !isFuture && selectDate(dateStr)}
                  title={hasArticles ? dateStr : undefined}
                  style={{
                    height: "28px",
                    width: "100%",
                    borderRadius: "3px",
                    fontSize: "0.5625rem",
                    fontFamily: "var(--font-ui)",
                    letterSpacing: "0.02em",
                    cursor: hasArticles && !isFuture ? "pointer" : "default",
                    backgroundColor: isSelected
                      ? "var(--accent)"
                      : isToday && !isSelected
                        ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                        : "transparent",
                    color: isSelected
                      ? "#fff"
                      : hasArticles && !isFuture
                        ? "var(--ink)"
                        : "var(--ink-faint)",
                    border:
                      isToday && !isSelected
                        ? "1px solid var(--accent)"
                        : "1px solid transparent",
                    fontWeight: hasArticles ? 500 : 400,
                    transition: "background-color 0.15s ease, color 0.15s ease",
                    position: "relative",
                  }}
                >
                  {day}
                  {hasArticles && !isSelected && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "3px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "3px",
                        height: "3px",
                        borderRadius: "50%",
                        backgroundColor: "var(--accent)",
                        display: "block",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
