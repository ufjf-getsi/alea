type Value = string | number | null | undefined;

export function buildHref(
  basePath: string,
  params: Record<string, Value> = {},
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }

  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
