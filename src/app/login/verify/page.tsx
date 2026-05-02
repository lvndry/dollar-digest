import Link from "next/link";

export default function VerifyPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display italic text-3xl mb-2" style={{ color: "var(--ink)" }}>
          Check your email
        </h1>
        <p
          className="font-ui text-[0.65rem] tracking-[0.06em] uppercase mb-8"
          style={{ color: "var(--ink-muted)" }}
        >
          A sign-in link is on its way
        </p>

        <p
          className="font-body text-sm leading-relaxed mb-10"
          style={{ color: "var(--ink-mid)" }}
        >
          We sent a magic link to your email address. Click it to sign in — no password
          required. The link expires in 24 hours.
        </p>

        <Link
          href="/login"
          className="font-ui text-[0.6rem] tracking-[0.08em] uppercase"
          style={{ color: "var(--accent)" }}
        >
          Use a different email
        </Link>
      </div>
    </div>
  );
}
