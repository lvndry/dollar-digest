"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg)",
        color: "var(--ink)",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p
        className="font-ui text-[0.575rem] tracking-[0.24em] uppercase mb-6"
        style={{ color: "var(--ink-muted)" }}
      >
        Something went wrong
      </p>
      <h1
        className="font-display italic mb-6"
        style={{
          fontSize: "clamp(2rem, 6vw, 3.5rem)",
          letterSpacing: "-0.025em",
          lineHeight: "1",
        }}
      >
        Unexpected error
      </h1>
      <p
        className="font-body mb-10 max-w-xs"
        style={{ color: "var(--ink-muted)", fontSize: "0.9375rem" }}
      >
        We couldn&apos;t load this page. Try refreshing — if the problem persists, check
        back shortly.
      </p>
      <button
        onClick={reset}
        className="font-ui text-[0.65rem] tracking-[0.12em] uppercase px-6 py-3 transition-opacity duration-150 hover:opacity-75"
        style={{ color: "var(--bg)", backgroundColor: "var(--ink)" }}
      >
        Try again
      </button>
      {error.digest && (
        <p
          className="font-ui text-[0.5rem] tracking-[0.1em] uppercase mt-8"
          style={{ color: "var(--ink-faint)" }}
        >
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
