"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { ThemeToggle } from "./ThemeToggle";
import { MobileTabBar } from "./MobileTabBar";
import { createCheckoutSession } from "@/app/actions";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";

const NAV_ITEMS = [
  { href: "/", label: "Today" },
  { href: "/tech", label: "Technology" },
  { href: "/politics", label: "Politics" },
  { href: "/archive", label: "Archive" },
];

interface SiteNavProps {
  session: Session | null;
}

export function SiteNav({ session }: SiteNavProps) {
  const pathname = usePathname();
  useSwipeNavigation();

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        borderBottom: "1px solid var(--border)",
        backgroundColor: "color-mix(in srgb, var(--bg) 92%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-display italic shrink-0"
          style={{ color: "var(--ink)", fontSize: "1rem", letterSpacing: "-0.01em" }}
        >
          The One Dollar Digest
        </Link>

        <nav className="hidden sm:flex items-center gap-8">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="font-ui text-[0.6rem] tracking-[0.1em] uppercase transition-opacity duration-150"
                style={{
                  color: active ? "var(--ink)" : "var(--ink-muted)",
                  fontWeight: active ? "500" : "400",
                  opacity: 1,
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <div className="hidden sm:flex items-center gap-3">
              {!session.user.subscribed && (
                <form action={createCheckoutSession}>
                  <button
                    type="submit"
                    className="font-ui text-[0.6rem] tracking-[0.1em] uppercase px-3 py-1.5 transition-opacity duration-150 hover:opacity-70"
                    style={{
                      color: "var(--bg)",
                      backgroundColor: "var(--accent)",
                    }}
                  >
                    Upgrade — $1/mo
                  </button>
                </form>
              )}
              <button
                onClick={() => signOut({ redirectTo: "/" })}
                className="font-ui text-[0.6rem] tracking-[0.1em] uppercase transition-opacity duration-150 hover:opacity-60"
                style={{ color: "var(--ink-muted)" }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-block font-ui text-[0.6rem] tracking-[0.1em] uppercase px-4 py-2 transition-opacity duration-150 hover:opacity-75"
              style={{
                color: "var(--bg)",
                backgroundColor: "var(--ink)",
              }}
            >
              Sign in
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>

      <MobileTabBar />
    </header>
  );
}
