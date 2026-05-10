interface RankedSourceUrl {
  url: string;
  score: number | null;
  index: number;
}

interface ImageSourceCandidateInput {
  sourceUrl?: unknown;
  sources?: unknown;
  fallbackSourceUrl?: unknown;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function optionalNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function dedupeUrls(urls: Array<string | null>): string[] {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    deduped.push(url);
  }

  return deduped;
}

function sortByScore(sources: RankedSourceUrl[]): RankedSourceUrl[] {
  const hasAtLeastOneScore = sources.some((source) => source.score != null);
  if (!hasAtLeastOneScore) return sources;

  return [...sources].sort((a, b) => {
    const scoreA = a.score ?? Number.NEGATIVE_INFINITY;
    const scoreB = b.score ?? Number.NEGATIVE_INFINITY;
    if (scoreA !== scoreB) return scoreB - scoreA;
    return a.index - b.index;
  });
}

export function buildImageSourceCandidates(input: ImageSourceCandidateInput): string[] {
  const rankedSources: RankedSourceUrl[] = [];

  if (Array.isArray(input.sources)) {
    for (const [index, source] of input.sources.entries()) {
      if (!isRecord(source)) continue;
      const url = optionalString(source.url);
      if (!url) continue;

      rankedSources.push({
        url,
        score: optionalNumber(source.score),
        index,
      });
    }
  }

  const orderedSourceUrls = sortByScore(rankedSources).map((source) => source.url);

  return dedupeUrls([
    optionalString(input.sourceUrl),
    ...orderedSourceUrls,
    optionalString(input.fallbackSourceUrl),
  ]);
}
