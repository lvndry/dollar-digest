"use client";

import { useSearchParams } from "next/navigation";
import { dateAwareHref } from "@/lib/nav";

export function useDateAwareNav(): (base: string) => string {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  return (base: string) => dateAwareHref(base, date);
}
