/// <reference types="bun-types" />
import { beforeEach, describe, expect, test, mock } from "bun:test";
import type { NextRequest } from "next/server";

let insertedRows: unknown[] = [];

mock.module("@/lib/db", () => ({
  db: {
    insert: () => ({
      values: (rows: unknown[]) => {
        insertedRows = rows;
        return {
          onConflictDoNothing: async () => undefined,
        };
      },
    }),
  },
}));

mock.module("next/cache", () => ({
  revalidateTag: () => undefined,
}));

const { POST } = await import("./route");

function ingestRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/articles/ingest", {
    method: "POST",
    headers: {
      authorization: "Bearer test-secret",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("POST /api/articles/ingest", () => {
  beforeEach(() => {
    process.env.INGEST_SECRET = "test-secret";
    insertedRows = [];
  });

  test("deduplicates duplicate article titles before inserting", async () => {
    const response = await POST(
      ingestRequest([
        {
          title: "Same Story",
          summary: "First summary",
          source: "Example",
          sourceUrl: "https://example.com/first",
          category: "tech",
          publishedAt: "2026-05-04",
          digestDate: "2026-05-04",
        },
        {
          title: " same story ",
          summary: "Duplicate summary",
          source: "Example",
          sourceUrl: "https://example.com/duplicate",
          category: "tech",
          publishedAt: "2026-05-04",
          digestDate: "2026-05-04",
        },
      ]),
    );

    await expect(response.json()).resolves.toEqual({ inserted: 1 });
    expect(insertedRows).toHaveLength(1);
    expect(insertedRows[0]).toMatchObject({ title: "Same Story" });
  });
});
