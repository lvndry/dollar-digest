import { describe, expect, test } from "bun:test";
import { buildImageSourceCandidates } from "./image-source-candidates";

describe("buildImageSourceCandidates", () => {
  test("keeps sourceUrl first and falls back to sources sorted by score", () => {
    const candidates = buildImageSourceCandidates({
      sourceUrl: "https://primary.example.com/story",
      sources: [
        { name: "B", url: "https://b.example.com/story", score: 0.62 },
        { name: "A", url: "https://a.example.com/story", score: 0.98 },
        { name: "C", url: "https://c.example.com/story", score: 0.31 },
      ],
    });

    expect(candidates).toEqual([
      "https://primary.example.com/story",
      "https://a.example.com/story",
      "https://b.example.com/story",
      "https://c.example.com/story",
    ]);
  });

  test("preserves source order when scores are missing", () => {
    const candidates = buildImageSourceCandidates({
      sourceUrl: null,
      sources: [
        { name: "One", url: "https://one.example.com/story" },
        { name: "Two", url: "https://two.example.com/story" },
      ],
    });

    expect(candidates).toEqual([
      "https://one.example.com/story",
      "https://two.example.com/story",
    ]);
  });

  test("deduplicates URLs while preserving first-seen order", () => {
    const candidates = buildImageSourceCandidates({
      sourceUrl: "https://same.example.com/story",
      sources: [
        { name: "Same", url: "https://same.example.com/story", score: 1 },
        { name: "Backup", url: "https://backup.example.com/story", score: 0.2 },
      ],
      fallbackSourceUrl: "https://backup.example.com/story",
    });

    expect(candidates).toEqual([
      "https://same.example.com/story",
      "https://backup.example.com/story",
    ]);
  });
});
