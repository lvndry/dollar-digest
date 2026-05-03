"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "countdown" | "building";

function getNextRunDate(): Date {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(6, 0, 0, 0);
  if (now >= next) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function getNextRunMs(): number {
  return getNextRunDate().getTime() - Date.now();
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

function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function todayUTC(): string {
  return new Date().toISOString().split("T")[0]!;
}

async function checkDigestReady(date: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/digest-status?date=${date}`);
    const json = (await res.json()) as { ready: boolean };
    return json.ready;
  } catch {
    return false;
  }
}

export function NextDigestCountdown() {
  const [phase, setPhase] = useState<Phase>("countdown");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [nextLocalTime, setNextLocalTime] = useState<string>("");
  const [dots, setDots] = useState("·");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown tick
  useEffect(() => {
    const tick = () => {
      const ms = getNextRunMs();
      setRemaining(ms);
      setNextLocalTime(formatLocalTime(getNextRunDate()));

      if (ms <= 0) {
        setPhase("building");
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Animated dots when building
  useEffect(() => {
    if (phase !== "building") return;
    const sequences = ["·", "··", "···", "··", "·"];
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % sequences.length;
      setDots(sequences[idx]!);
    }, 400);
    return () => clearInterval(id);
  }, [phase]);

  // Poll for digest readiness when building
  useEffect(() => {
    if (phase !== "building") {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    const poll = async () => {
      const ready = await checkDigestReady(todayUTC());
      if (ready) {
        setPhase("countdown");
      }
    };

    poll();
    pollRef.current = setInterval(poll, 30_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [phase]);

  if (remaining === null) return null;

  if (phase === "building") {
    return (
      <span
        className="font-ui text-[0.575rem] tracking-[0.08em] text-center"
        style={{ color: "var(--accent)" }}
        title="The AI is building today's digest"
      >
        building today's digest {dots}
      </span>
    );
  }

  return (
    <span
      className="font-ui text-[0.575rem] tracking-[0.08em] tabular-nums flex flex-col items-center text-center leading-normal"
      style={{ color: "var(--ink-faint)" }}
      title={`Next AI digest run at ${nextLocalTime} (06:00 UTC)`}
    >
      <span>next digest at {nextLocalTime}</span>
      <span>in {formatCountdown(remaining)}</span>
    </span>
  );
}
