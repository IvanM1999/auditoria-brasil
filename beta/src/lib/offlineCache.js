// Simple offline cache utility — stores entity data in localStorage
// so content is readable without a connection.

const PREFIX = "ea_cache_";

export function cacheData(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch (e) {
    /* storage full or unavailable — ignore */
  }
}

export function getCachedData(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw).data;
  } catch (e) {
    return null;
  }
}

export function isOnline() {
  return navigator.onLine;
}

/**
 * Tries the API first; on success caches the result.
 * If the API fails (offline), falls back to cached data.
 * Throws only if both API and cache are empty.
 */
export async function fetchWithCache(key, fetchFn) {
  try {
    const data = await fetchFn();
    cacheData(key, data);
    return data;
  } catch (e) {
    const cached = getCachedData(key);
    if (cached) return cached;
    throw e;
  }
}