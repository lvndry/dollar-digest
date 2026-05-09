export function dateAwareHref(base: string, date: string | null): string {
  if (!date) return base;
  const [path, search] = base.split("?");
  const params = new URLSearchParams(search);
  params.set("date", date);
  return path + "?" + params.toString();
}
