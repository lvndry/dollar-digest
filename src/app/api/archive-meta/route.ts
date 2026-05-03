import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessArchive } from "@/lib/access";
import { getCachedAvailableDates } from "@/lib/available-digest-dates";

export async function GET() {
  const session = await auth();
  const availableDates = await getCachedAvailableDates();
  return NextResponse.json({
    availableDates,
    canAccessArchive: canAccessArchive(session),
  });
}
