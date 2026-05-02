"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { NextDigestCountdown } from "./NextDigestCountdown";

const NAV_ITEMS = [
  { href: "/", label: "Today" },
  { href: "/tech", label: "Technology" },
  { href: "/politics", label: "Politics" },
  { href: "/archive", label: "Archive" },
];

export function SiteNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "color-mix(in srgb, var(--bg) 85%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-8">
        <Link
          href="/"
          className="font-display italic text-[1.125rem] tracking-[-0.01em] shrink-0"
          style={{ color: "var(--ink)" }}
        >
          The Dollar Digest
        </Link>

        <nav className="hidden sm:flex items-center gap-7">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="font-ui text-[0.625rem] tracking-[0.06em] uppercase transition-colors duration-150"
                style={{
                  color: active ? "var(--ink)" : "var(--ink-muted)",
                  fontWeight: active ? "500" : "400",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <NextDigestCountdown />

          {session?.user ? (
            <div className="hidden sm:flex items-center gap-3">
              <span
                className="font-ui text-[0.6rem] tracking-[0.04em]"
                style={{ color: "var(--ink-muted)" }}
              >
                {session.user.email}
              </span>
              <button
                onClick={() => signOut({ redirectTo: "/" })}
                className="btn-accent font-ui text-[0.6rem] tracking-[0.08em] uppercase px-3 py-1.5 border"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-accent hidden sm:inline-block font-ui text-[0.6rem] tracking-[0.08em] uppercase px-3 py-1.5 border"
            >
              Sign in
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
