/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { dateAwareHref } from "./nav";

describe("dateAwareHref", () => {
  test("returns base path unchanged when date is null", () => {
    expect(dateAwareHref("/", null)).toBe("/");
    expect(dateAwareHref("/tech", null)).toBe("/tech");
    expect(dateAwareHref("/politics", null)).toBe("/politics");
  });

  test("appends date query param when date is provided", () => {
    expect(dateAwareHref("/", "2026-05-08")).toBe("/?date=2026-05-08");
    expect(dateAwareHref("/tech", "2026-05-08")).toBe("/tech?date=2026-05-08");
    expect(dateAwareHref("/politics", "2026-01-01")).toBe("/politics?date=2026-01-01");
  });

  test("returns base path unchanged when date is empty string", () => {
    expect(dateAwareHref("/", "")).toBe("/");
  });

  test("correctly appends date when base already has query parameters", () => {
    expect(dateAwareHref("/search?q=term", "2026-05-08")).toBe(
      "/search?q=term&date=2026-05-08",
    );
  });

  test("overwrites existing date param when base already has one", () => {
    expect(dateAwareHref("/?date=2026-01-01", "2026-05-08")).toBe("/?date=2026-05-08");
  });
});
