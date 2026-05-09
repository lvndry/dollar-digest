export function dateAwareHref(base: string): string {
  const date = new URLSearchParams(window.location.search).get("date");
  return date ? `${base}?date=${date}` : base;
}
