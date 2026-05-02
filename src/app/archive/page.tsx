import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Archive",
  description: "Past issues of The Dollar Digest.",
};

export default function ArchivePage() {
  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--ink)" }}
    >
      <SiteNav />

      <div className="max-w-5xl mx-auto px-6 pt-16 pb-14 text-center">
        <h1
          className="font-display italic text-[clamp(2.25rem,6vw,4.5rem)] tracking-[-0.025em] leading-[0.93] mb-6"
          style={{ color: "var(--ink)" }}
        >
          Archive
        </h1>
        <p
          className="font-ui text-[0.6875rem] tracking-[0.06em] uppercase"
          style={{ color: "var(--ink-muted)" }}
        >
          Past issues coming soon
        </p>
        <div className="mt-12 h-px" style={{ backgroundColor: "var(--border)" }} />
      </div>
    </div>
  );
}
