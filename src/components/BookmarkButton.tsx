"use client";

import { useState, useTransition } from "react";
import { toggleBookmark, createCheckoutSession } from "@/app/actions";

interface BookmarkButtonProps {
  articleId: number;
  initialSaved: boolean;
  isLoggedIn: boolean;
  canBookmark: boolean;
}

export function BookmarkButton({
  articleId,
  initialSaved,
  isLoggedIn,
  canBookmark,
}: BookmarkButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();

  function handleClick() {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    if (!canBookmark) {
      startTransition(() => createCheckoutSession());
      return;
    }

    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      try {
        await toggleBookmark(articleId);
      } catch {
        setSaved(!next);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove bookmark" : "Save to bookmarks"}
      className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150"
      style={{ color: saved ? "var(--accent)" : "var(--ink-muted)" }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
