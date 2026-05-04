/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { shouldKeepArticleForDigestDate } from "./article-date-filter";

describe("shouldKeepArticleForDigestDate", () => {
  test("keeps articles whose issueDate matches the digest date", () => {
    expect(
      shouldKeepArticleForDigestDate({ issueDate: "2026-05-04" }, "2026-05-04"),
    ).toBe(true);
  });

  test("drops articles whose issueDate is outside the digest date", () => {
    expect(
      shouldKeepArticleForDigestDate({ issueDate: "2026-05-03" }, "2026-05-04"),
    ).toBe(false);
  });

  test("uses publishedDate when issueDate is absent", () => {
    expect(
      shouldKeepArticleForDigestDate(
        { publishedDate: "2026-05-04T08:30:00Z" },
        "2026-05-04",
      ),
    ).toBe(true);
    expect(
      shouldKeepArticleForDigestDate(
        { publishedDate: "2026-05-03T23:30:00Z" },
        "2026-05-04",
      ),
    ).toBe(false);
  });

  test("keeps articles without a usable date signal", () => {
    expect(shouldKeepArticleForDigestDate({}, "2026-05-04")).toBe(true);
    expect(shouldKeepArticleForDigestDate({ issueDate: "unknown" }, "2026-05-04")).toBe(
      true,
    );
  });
});
