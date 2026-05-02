import Link from "next/link";
import { createCheckoutSession } from "@/app/actions";

interface ArchivePaywallProps {
  isSignedIn: boolean;
  daysRemaining?: number;
}

export function ArchivePaywall({ isSignedIn, daysRemaining = 0 }: ArchivePaywallProps) {
  return (
    <div
      className="flex flex-col items-center text-center py-20 px-6 max-w-md mx-auto"
      style={{ gap: "1.25rem" }}
    >
      <p
        className="font-ui text-[0.55rem] tracking-[0.18em] uppercase"
        style={{ color: "var(--ink-faint)" }}
      >
        Premium content
      </p>

      <h2
        className="font-display italic text-[clamp(1.75rem,5vw,2.75rem)] leading-[1.1] tracking-[-0.02em]"
        style={{ color: "var(--ink)" }}
      >
        {isSignedIn ? "Your free trial has ended" : "Read every digest, past and present"}
      </h2>

      <p
        className="font-body text-[0.9375rem] leading-[1.8]"
        style={{ color: "var(--ink-muted)" }}
      >
        {isSignedIn
          ? "Subscribe for $1/month to access all previous digests."
          : "Sign in for a 3-day free trial, then just $1/month. Cancel anytime."}
      </p>

      {isSignedIn ? (
        <form action={createCheckoutSession}>
          <button
            type="submit"
            className="btn-accent font-ui text-[0.6875rem] tracking-[0.08em] uppercase px-6 py-3 border"
          >
            Subscribe for $1 / month
          </button>
        </form>
      ) : (
        <Link
          href="/login"
          className="btn-accent font-ui text-[0.6875rem] tracking-[0.08em] uppercase px-6 py-3 border"
        >
          Start free trial
        </Link>
      )}

      {isSignedIn && daysRemaining > 0 && (
        <p
          className="font-ui text-[0.575rem] tracking-[0.06em]"
          style={{ color: "var(--ink-faint)" }}
        >
          {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left in your trial
        </p>
      )}

      <div className="mt-4 h-px w-full" style={{ backgroundColor: "var(--border)" }} />

      <p
        className="font-ui text-[0.575rem] tracking-[0.06em]"
        style={{ color: "var(--ink-faint)" }}
      >
        Today&apos;s digest is always free. No credit card needed to sign in.
      </p>
    </div>
  );
}
