"use client";

import { useEffect, useState } from "react";

function getNextRunMs(): number {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(6, 0, 0, 0);
  if (now >= next) next.setUTCDate(next.getUTCDate() + 1);
  return next.getTime() - now.getTime();
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

export function NextDigestCountdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(getNextRunMs());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (remaining === null) return null;

  return (
    <span
      className="font-ui text-[0.575rem] tracking-[0.08em] tabular-nums"
      style={{ color: "var(--ink-faint)" }}
      title="Next AI digest run (06:00 UTC)"
    >
      next digest in {formatCountdown(remaining)}
    </span>
  );
}
