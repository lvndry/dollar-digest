import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const ingestSecret = process.env.INGEST_SECRET;
  if (!ingestSecret) {
    return NextResponse.json(
      { error: "Revalidate endpoint is not configured" },
      { status: 500 },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${ingestSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("articles", "default");
  return NextResponse.json({ revalidated: true });
}
