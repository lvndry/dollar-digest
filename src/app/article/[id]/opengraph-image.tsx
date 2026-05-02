import { ImageResponse } from "next/og";
import type { Article } from "@/lib/schema";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function getArticle(id: string): Promise<Article | null> {
  try {
    const { db } = await import("@/lib/db");
    const { articles } = await import("@/lib/schema");
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.id, parseInt(id, 10)))
      .limit(1);

    return rows[0] ?? null;
  } catch {
    const { mockArticles } = await import("@/lib/mock-data");
    return mockArticles.find((a) => a.id === parseInt(id, 10)) ?? null;
  }
}

const BIAS_COLOR: Record<string, string> = {
  "far-left": "#1a2f7a",
  left: "#2558c8",
  center: "#2d7a52",
  right: "#c83030",
  "far-right": "#7a1a1a",
};

const SUB_COLOR: Record<string, string> = {
  AI: "#6d28d9",
  VC: "#0f7a50",
  Research: "#1565a8",
  Startup: "#c4621a",
  Product: "#0a7a7a",
  Security: "#a81515",
};

export default async function ArticleOgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f7f4ee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          fontSize: 48,
          color: "#141210",
        }}
      >
        The Dollar Digest
      </div>,
      size,
    );
  }

  const accentColor =
    article.category === "politics" && article.bias
      ? BIAS_COLOR[article.bias]
      : article.subcategory
        ? (SUB_COLOR[article.subcategory] ?? "#c4882a")
        : "#c4882a";

  const badgeLabel =
    article.category === "politics" && article.bias
      ? article.bias.replace("-", " ").toUpperCase()
      : (article.subcategory?.toUpperCase() ?? "");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#f7f4ee",
        display: "flex",
        flexDirection: "column",
        padding: "56px 80px",
        fontFamily: "Georgia, serif",
        borderTop: `6px solid ${accentColor}`,
      }}
    >
      {/* Publication name */}
      <div
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 13,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#7a746e",
          marginBottom: 32,
        }}
      >
        THE DOLLAR DIGEST
      </div>

      {/* Badge */}
      {badgeLabel && (
        <div
          style={{
            background: accentColor,
            color: "#fff",
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "4px 12px",
            borderRadius: 2,
            marginBottom: 24,
            display: "inline-flex",
            alignSelf: "flex-start",
          }}
        >
          {badgeLabel}
        </div>
      )}

      {/* Headline */}
      <h1
        style={{
          flex: 1,
          fontSize: 58,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          color: "#141210",
          margin: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        {article.title}
      </h1>

      {/* Footer */}
      <div style={{ height: 1, background: "#d8d2c8", marginBottom: 20 }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#7a746e",
        }}
      >
        <span style={{ fontWeight: 700, color: "#4a4640" }}>{article.source}</span>
        <span>$1 / month · dollardigest.com</span>
      </div>
    </div>,
    size,
  );
}
