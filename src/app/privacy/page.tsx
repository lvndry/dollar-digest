import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How The One Dollar Digest collects and uses your data.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "May 2, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2
        className="font-ui text-[0.6rem] tracking-widest uppercase mb-3"
        style={{ color: "var(--ink-muted)" }}
      >
        {title}
      </h2>
      <div
        className="font-body text-sm leading-relaxed space-y-3"
        style={{ color: "var(--ink-mid)" }}
      >
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <main className="max-w-2xl mx-auto px-6 py-16">
        <p
          className="font-ui text-[0.6rem] tracking-widest uppercase mb-2"
          style={{ color: "var(--ink-muted)" }}
        >
          Legal
        </p>
        <h1 className="font-display italic text-3xl mb-2" style={{ color: "var(--ink)" }}>
          Privacy Policy
        </h1>
        <div
          className="w-8 h-px mb-3"
          style={{ backgroundColor: "var(--border-strong)" }}
        />
        <p
          className="font-ui text-[0.575rem] tracking-[0.06em] mb-12"
          style={{ color: "var(--ink-faint)" }}
        >
          Last updated: {LAST_UPDATED}
        </p>

        <Section title="Who we are">
          <p>
            The One Dollar Digest (
            <strong style={{ color: "var(--ink)" }}>onedollardigest.com</strong>) is an
            AI-curated daily news service. For any privacy-related questions, contact us
            at{" "}
            <a href="mailto:lvndry@protonmail.com" style={{ color: "var(--accent)" }}>
              lvndry@protonmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="Data we collect">
          <p>We collect only what is necessary to operate the service:</p>
          <ul className="list-none space-y-2 mt-2">
            {[
              [
                "Email address",
                "to authenticate you via magic link and send you service emails.",
              ],
              ["Subscription status", "to determine which content you can access."],
              ["Account creation date", "to manage your free trial window."],
              [
                "Payment data",
                "handled entirely by Stripe — we never see your card details.",
              ],
            ].map(([label, desc]) => (
              <li key={label} className="flex gap-2">
                <span style={{ color: "var(--accent)" }} className="mt-0.5 shrink-0">
                  ✦
                </span>
                <span>
                  <strong style={{ color: "var(--ink)" }}>{label}</strong> — {desc}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="How we use your data">
          <p>Your data is used solely to:</p>
          <ul className="list-none space-y-2 mt-2">
            {[
              "Authenticate your account via email magic link",
              "Deliver transactional emails (sign-in links, trial notifications)",
              "Process and manage your subscription via Stripe",
              "Gate access to premium archive content",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span style={{ color: "var(--accent)" }} className="mt-0.5 shrink-0">
                  ✦
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            We do not sell, rent, or share your personal data with third parties for
            marketing.
          </p>
        </Section>

        <Section title="Third-party services">
          <p>We use the following sub-processors:</p>
          <ul className="list-none space-y-2 mt-2">
            {[
              ["Resend", "Transactional email delivery."],
              ["Stripe", "Payment processing. Governed by Stripe's privacy policy."],
              ["Turso", "Database hosting (SQLite). Your data is stored in the EU."],
              ["Vercel", "Hosting and edge delivery."],
            ].map(([name, desc]) => (
              <li key={name} className="flex gap-2">
                <span style={{ color: "var(--accent)" }} className="mt-0.5 shrink-0">
                  ✦
                </span>
                <span>
                  <strong style={{ color: "var(--ink)" }}>{name}</strong> — {desc}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Data retention">
          <p>
            We retain your account data for as long as your account is active. You may
            request deletion at any time by emailing{" "}
            <a href="mailto:lvndry@protonmail.com" style={{ color: "var(--accent)" }}>
              lvndry@protonmail.com
            </a>
            . We will delete your account and all associated data within 30 days.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            Depending on your jurisdiction you may have rights to access, correct, port,
            or erase your personal data. To exercise any of these rights, contact us at{" "}
            <a href="mailto:lvndry@protonmail.com" style={{ color: "var(--accent)" }}>
              lvndry@protonmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            We use a single session cookie set by NextAuth to keep you signed in. No
            tracking or advertising cookies are used.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we make material changes to this policy we will notify you by email and
            update the date at the top of this page.
          </p>
        </Section>

        <div className="pt-8 border-t" style={{ borderColor: "var(--border)" }}>
          <Link
            href="/"
            className="font-ui text-[0.6rem] tracking-[0.08em] uppercase"
            style={{ color: "var(--accent)" }}
          >
            ← Back to digest
          </Link>
        </div>
      </main>
    </>
  );
}
