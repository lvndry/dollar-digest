"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Today" },
  { href: "/tech", label: "Technology" },
  { href: "/politics", label: "Politics" },
  { href: "/archive", label: "Archive" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex flex-col gap-1 sticky top-8 w-36 shrink-0">
      <span className="font-ui text-[0.55rem] tracking-[0.14em] uppercase text-ink-faint mb-3">
        Navigate
      </span>
      {NAV_ITEMS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={[
              "font-ui text-[0.6875rem] tracking-[0.06em] uppercase py-1 transition-colors duration-150",
              active ? "text-ink font-bold" : "text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            {active && (
              <span className="inline-block w-2 h-px bg-gold mr-1.5 translate-y-[-1px]" />
            )}
            {label}
          </Link>
        );
      })}

      <div className="mt-8 pt-6 border-t border-rule">
        <span className="font-ui text-[0.55rem] tracking-[0.14em] uppercase text-ink-faint block mb-3">
          Subscribe
        </span>
        <a
          href="/subscribe"
          className="font-ui text-[0.6rem] tracking-[0.08em] uppercase text-gold border border-gold px-3 py-1.5 hover:bg-gold hover:text-white transition-colors duration-150 block text-center"
        >
          $1 / month
        </a>
      </div>
    </nav>
  );
}
