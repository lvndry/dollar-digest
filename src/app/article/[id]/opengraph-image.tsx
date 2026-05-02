import { ImageResponse } from "next/og";
import { auth } from "@/auth";
import { canAccessDigestDate } from "@/lib/access";
import type { Article } from "@/lib/schema";

export const alt = "Article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

function getAccentColor(article: Article): string | undefined {
  if (article.category === "politics" && article.bias) {
    return BIAS_COLOR[article.bias];
  }

  if (article.subcategory) {
    return SUB_COLOR[article.subcategory] ?? "#3d6b5c";
  }

  return "#3d6b5c";
}

function getBadgeLabel(article: Article): string {
  if (article.category === "politics" && article.bias) {
    return article.bias.replace("-", " ").toUpperCase();
  }

  return article.subcategory?.toUpperCase() ?? "";
}

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
    return null;
  }
}

export default async function ArticleOgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  const session = await auth();
  const canReadArticle = article
    ? canAccessDigestDate(article.digestDate, session)
    : false;

  if (!article || !canReadArticle) {
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
        {article ? "Premium Archive" : "The One Dollar Digest"}
      </div>,
      size,
    );
  }

  const accentColor = getAccentColor(article);
  const badgeLabel = getBadgeLabel(article);

  const title =
    article.title.length > 80 ? article.title.slice(0, 77) + "…" : article.title;

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
            marginBottom: 24,
            display: "inline-flex",
            alignSelf: "flex-start",
          }}
        >
          {badgeLabel}
        </div>
      )}

      <h1
        style={{
          flex: 1,
          fontSize: title.length > 60 ? 52 : 62,
          fontStyle: "italic",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          color: "#141210",
          margin: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        {title}
      </h1>

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
        <span>dollardigest.com · $1/month</span>
      </div>
    </div>,
    size,
  );
}
