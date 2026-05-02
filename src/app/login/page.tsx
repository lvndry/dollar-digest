"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await signIn("resend", { email, redirectTo: "/" });
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="w-full max-w-sm">
        <Link href="/">
          <h1
            className="font-display italic text-3xl mb-2 text-center hover:opacity-70 transition-opacity duration-150"
            style={{ color: "var(--ink)" }}
          >
            The Dollar Digest
          </h1>
        </Link>
        <p
          className="font-ui text-[0.65rem] tracking-[0.06em] uppercase text-center mb-10"
          style={{ color: "var(--ink-muted)" }}
        >
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="font-ui text-[0.6rem] tracking-[0.08em] uppercase"
              style={{ color: "var(--ink-muted)" }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 font-ui text-sm border bg-transparent outline-none transition-colors duration-150"
              style={{
                borderColor: "var(--border-strong)",
                color: "var(--ink)",
                backgroundColor: "var(--surface)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
            />
          </div>

          <button
            type="submit"
            disabled={loading || email.length === 0}
            className="btn-accent font-ui text-[0.6rem] tracking-[0.08em] uppercase px-4 py-3 border disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: "var(--accent)", borderColor: "var(--accent)" }}
          >
            {loading ? "Sending link…" : "Send magic link"}
          </button>
        </form>

        <p
          className="font-ui text-[0.6rem] tracking-[0.04em] text-center mt-8"
          style={{ color: "var(--ink-faint)" }}
        >
          We&rsquo;ll email you a sign-in link — no password needed.
        </p>
      </div>
    </div>
  );
}
