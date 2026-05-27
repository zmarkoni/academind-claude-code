const requests = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // 5 requests per window

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const key = identifier;

  if (!requests.has(key)) {
    requests.set(key, [now]);
    return true;
  }

  const timestamps = requests.get(key)!;

  const recentRequests = timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (recentRequests.length < MAX_REQUESTS) {
    recentRequests.push(now);
    requests.set(key, recentRequests);
    return true;
  }

  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of requests.entries()) {
    const recent = timestamps.filter((ts) => now - ts < WINDOW_MS);
    if (recent.length === 0) {
      requests.delete(key);
    } else {
      requests.set(key, recent);
    }
  }
}, 60000);
