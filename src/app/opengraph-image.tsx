import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "The One Dollar Digest";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#f7f4ee",
        display: "flex",
        flexDirection: "column",
        padding: "64px 80px",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ height: 3, background: "#141210", marginBottom: 24 }} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
          fontFamily: "'Courier New', monospace",
          fontSize: 13,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7a746e",
        }}
      >
        <span>{today}</span>
        <span
          style={{
            color: "#c4882a",
            border: "1px solid #c4882a",
            padding: "4px 12px",
            fontWeight: 700,
          }}
        >
          $1 / MONTH
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontSize: 112,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 0.88,
            textAlign: "center",
            color: "#141210",
            margin: 0,
          }}
        >
          THE ONE DOLLAR DIGEST
        </h1>
      </div>

      <div style={{ height: 1, background: "#141210", marginBottom: 20 }} />
      <p
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 14,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#7a746e",
          textAlign: "center",
          margin: 0,
        }}
      >
        AI-curated news that respects your time and wallet
      </p>
    </div>,
    size,
  );
}
