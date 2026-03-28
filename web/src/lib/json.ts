export function parseJsonArray(s: string | null | undefined, fallback: string[] = []): string[] {
  if (!s) return fallback;
  try {
    const v = JSON.parse(s) as unknown;
    return Array.isArray(v) ? v.map(String) : fallback;
  } catch {
    return fallback;
  }
}

export function stringifyJson(data: unknown): string {
  return JSON.stringify(data);
}
