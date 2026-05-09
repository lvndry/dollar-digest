export function dateAwareHref(base: string, date: string | null): string {
  return date ? `${base}?date=${date}` : base;
}
