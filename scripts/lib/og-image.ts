const PATTERNS = [
  /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
  /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
];

// Reads only the head of the page — stops at </head> or the 12KB mark.
async function readHead(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DollarDigest/1.0)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok || !res.body) return "";

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let html = "";

  try {
    while (html.length < 64_000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      if (html.includes("</head>") || html.includes("<body")) break;
    }
  } finally {
    reader.cancel();
  }

  return html;
}

export async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const html = await readHead(url);
    for (const pattern of PATTERNS) {
      const match = html.match(pattern);
      if (match?.[1]?.startsWith("http")) return match[1].trim();
    }
    return null;
  } catch {
    return null;
  }
}

// Fetches images with bounded concurrency to avoid hammering servers.
export async function fetchOgImages(
  urls: (string | null)[],
  concurrency = 6,
): Promise<(string | null)[]> {
  const results: (string | null)[] = new Array(urls.length).fill(null);
  const queue = urls.map((url, index) => ({ url, index }));

  async function worker(): Promise<void> {
    while (true) {
      const item = queue.shift();
      if (!item) return;
      if (!item.url) continue;
      results[item.index] = await fetchOgImage(item.url);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, urls.length) }, () => worker()),
  );

  return results;
}
