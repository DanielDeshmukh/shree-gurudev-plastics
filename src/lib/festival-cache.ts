let cache: { data: Record<string, unknown>; ts: number } | null = null;
const CACHE_TTL = 60_000;

export function getFestivalCache() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return cache.data;
  }
  return null;
}

export function setFestivalCache(data: Record<string, unknown>) {
  cache = { data, ts: Date.now() };
}

export function clearFestivalCache() {
  cache = null;
}
