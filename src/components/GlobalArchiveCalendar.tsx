"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { DateCalendar } from "@/components/DateCalendar";

type ArchiveMeta = {
  availableDates: string[];
  canAccessArchive: boolean;
};

const DIGEST_PATHS = new Set(["/", "/tech", "/politics"]);

function CalendarFallback() {
  return (
    <div className="mt-2">
      <div
        className="flex items-center gap-2 mx-auto font-ui text-[0.6rem] tracking-[0.12em] uppercase w-fit"
        style={{ color: "var(--ink-muted)" }}
      >
        ▾ browse archive
      </div>
    </div>
  );
}

function GlobalArchiveCalendarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [meta, setMeta] = useState<ArchiveMeta | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/archive-meta")
      .then((r) => r.json())
      .then((data: ArchiveMeta) => {
        if (!cancelled) setMeta(data);
      })
      .catch(() => {
        if (!cancelled) setMeta({ availableDates: [], canAccessArchive: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (pathname.startsWith("/login")) return null;

  if (!meta) return <CalendarFallback />;

  const today = new Date().toISOString().split("T")[0]!;
  const selectedDate = searchParams.get("date") ?? today;
  const navigateBasePath = DIGEST_PATHS.has(pathname) ? pathname : "/";

  return (
    <DateCalendar
      availableDates={meta.availableDates}
      selectedDate={selectedDate}
      canAccessArchive={meta.canAccessArchive}
      navigateBasePath={navigateBasePath}
    />
  );
}

export function GlobalArchiveCalendar() {
  return (
    <Suspense fallback={<CalendarFallback />}>
      <GlobalArchiveCalendarInner />
    </Suspense>
  );
}
