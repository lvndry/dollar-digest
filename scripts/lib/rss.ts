export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

function extractTag(xml: string, tag: string): string {
  const cdata = xml.match(
    new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i"),
  );
  if (cdata) return cdata[1].trim();
  const plain = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return plain ? plain[1].replace(/<[^>]+>/g, "").trim() : "";
}

function parseItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1];
    // <link> in RSS is often a bare text node between tags (not attribute-based)
    const linkMatch =
      block.match(/<link[^>]*>([^<]+)<\/link>/i) ??
      block.match(/<link[^>]+href="([^"]+)"/i);

    items.push({
      title: extractTag(block, "title"),
      link: linkMatch ? linkMatch[1].trim() : "",
      description: extractTag(block, "description"),
      pubDate: extractTag(block, "pubDate") || extractTag(block, "published"),
    });
  }

  return items;
}

export async function fetchFeed(url: string): Promise<RssItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "DollarDigest/1.0 (+https://dollardigest.com)" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseItems(xml);
  } catch {
    return [];
  }
}

export function filterRecent(items: RssItem[], hours = 26): RssItem[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return items.filter((item) => {
    const date = new Date(item.pubDate);
    return !isNaN(date.getTime()) && date.getTime() > cutoff;
  });
}
