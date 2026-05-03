export function DigestFeedWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="digest-feed"
      style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--ink)" }}
    >
      {children}
    </div>
  );
}
