type ArticleDateFields = {
  issueDate?: unknown;
  issue_date?: unknown;
  publishedDate?: unknown;
};

function normalizeDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  const isoDatePrefix = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDatePrefix) return isoDatePrefix[1]!;

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

export function shouldKeepArticleForDigestDate(
  article: ArticleDateFields,
  digestDate: string,
): boolean {
  const issueDate =
    normalizeDate(article.issueDate) ??
    normalizeDate(article.issue_date) ??
    normalizeDate(article.publishedDate);

  return issueDate === null || issueDate === digestDate;
}
