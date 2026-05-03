"use client";

import { useState } from "react";
import Link from "next/link";
import { sendContactMessage } from "./actions";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const result = await sendContactMessage({ email, message });
    setStatus(result.ok ? "sent" : "error");
  }

  return (
    <>
      <main
        className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="w-full max-w-sm">
          <p
            className="font-ui text-[0.6rem] tracking-widest uppercase mb-2 text-center"
            style={{ color: "var(--ink-muted)" }}
          >
            Get in touch
          </p>
          <h1
            className="font-display italic text-3xl mb-2 text-center"
            style={{ color: "var(--ink)" }}
          >
            Contact
          </h1>
          <div
            className="w-8 h-px mx-auto mb-8"
            style={{ backgroundColor: "var(--border-strong)" }}
          />

          {status === "sent" ? (
            <div className="text-center">
              <p className="font-ui text-sm mb-6" style={{ color: "var(--ink-mid)" }}>
                Message received. We&rsquo;ll get back to you shortly.
              </p>
              <Link
                href="/"
                className="font-ui text-[0.6rem] tracking-[0.08em] uppercase"
                style={{ color: "var(--accent)" }}
              >
                ← Back to digest
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="font-ui text-[0.6rem] tracking-[0.08em] uppercase"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Your email
                </label>
                <input
                  id="email"
                  type="email"
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
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-strong)")
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="message"
                  className="font-ui text-[0.6rem] tracking-[0.08em] uppercase"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Your message…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 font-ui text-sm border bg-transparent outline-none transition-colors duration-150 resize-none"
                  style={{
                    borderColor: "var(--border-strong)",
                    color: "var(--ink)",
                    backgroundColor: "var(--surface)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-strong)")
                  }
                />
              </div>

              {status === "error" && (
                <p
                  className="font-ui text-[0.6rem] tracking-[0.04em]"
                  style={{ color: "var(--color-bias-right)" }}
                >
                  Something went wrong. Email us directly at{" "}
                  <a
                    href="mailto:lvndry@protonmail.com"
                    style={{ color: "var(--accent)" }}
                  >
                    lvndry@protonmail.com
                  </a>
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending" || !email || !message}
                className="btn-accent font-ui text-[0.6rem] tracking-[0.08em] uppercase px-4 py-3 border disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: "var(--accent)", borderColor: "var(--accent)" }}
              >
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
