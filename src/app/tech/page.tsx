import type { Metadata } from "next";
import { DigestGrid } from "@/components/DigestGrid";
import { ArchivePaywall } from "@/components/ArchivePaywall";
import { loadDigestDay } from "@/lib/digest-day";

export const metadata: Metadata = {
  title: "Technology",
  description:
    "Today's most important tech stories: AI, startups, research, security and more. Curated daily.",
  alternates: { canonical: "/tech" },
  keywords: [
    "tech news",
    "AI news",
    "startup funding",
    "cybersecurity",
    "research papers",
    "product launches",
  ],
  openGraph: {
    title: "Technology · The One Dollar Digest",
    description:
      "Today's most important tech stories: AI, startups, research, security and more.",
    images: [
      {
        url: "/tech/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The One Dollar Digest: Technology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: "/tech/opengraph-image", alt: "The One Dollar Digest: Technology" }],
  },
};

interface TechPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function TechPage({ searchParams }: TechPageProps) {
  const { session, isToday, hasAccess, articles, displayDate } =
    await loadDigestDay(searchParams);

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--ink)" }}
    >
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-10 text-center">
        <p
          className="font-ui text-[0.575rem] tracking-[0.24em] uppercase mb-10 fade-in"
          style={{ color: "var(--ink-muted)", animationDelay: "0ms" }}
        >
          {isToday ? `Today · ${displayDate}` : displayDate}
        </p>
        <h1
          className="font-display italic leading-[0.86] mb-12 fade-up"
          style={{
            color: "var(--ink)",
            fontSize: "clamp(3rem, 9vw, 6rem)",
            letterSpacing: "-0.035em",
            animationDelay: "50ms",
          }}
        >
          Technology
        </h1>
        <div
          className="h-px fade-in"
          style={{ backgroundColor: "var(--border)", animationDelay: "130ms" }}
        />
      </div>

      <main className="max-w-5xl mx-auto px-6 pb-24">
        {!hasAccess ? (
          <ArchivePaywall isSignedIn={!!session?.user} />
        ) : articles.length === 0 ? (
          <p
            className="text-center font-ui text-[0.6875rem] tracking-[0.06em] py-20"
            style={{ color: "var(--ink-muted)" }}
          >
            No digest available for this date.
          </p>
        ) : (
          <DigestGrid articles={articles} category="tech" label="Technology" />
        )}
      </main>

      <footer
        className="max-w-5xl mx-auto px-6 border-t pb-16 pt-8 flex items-center justify-between flex-wrap gap-4"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="font-ui text-[0.575rem] tracking-[0.08em] uppercase"
          style={{ color: "var(--ink-faint)" }}
        >
          © {new Date().getFullYear()} The One Dollar Digest
        </span>
        <span
          className="font-display italic text-[0.875rem]"
          style={{ color: "var(--ink-muted)" }}
        >
          One dollar. Every story that matters.
        </span>
        <span
          className="font-ui text-[0.575rem] tracking-[0.08em] uppercase"
          style={{ color: "var(--ink-faint)" }}
        >
          Powered by AI
        </span>
      </footer>
    </div>
  );
}
