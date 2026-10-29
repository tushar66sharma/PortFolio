// In-memory sliding-window limiter, per IP. Best-effort: each serverless
// instance keeps its own counters, so Groq's limits remain the hard ceiling.
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const MAX_IPS = 5000;

export function createRateLimiter({ perMinute = 6, perDay = 40, now = Date.now } = {}) {
  const hits = new Map();

  return {
    hit(ip) {
      const t = now();
      const recent = (hits.get(ip) ?? []).filter((stamp) => t - stamp < DAY);
      const lastMinute = recent.filter((stamp) => t - stamp < MINUTE).length;
      const allowed = lastMinute < perMinute && recent.length < perDay;
      if (allowed) recent.push(t);

      hits.delete(ip); // re-insert so Map order tracks recency
      hits.set(ip, recent);
      if (hits.size > MAX_IPS) hits.delete(hits.keys().next().value);
      return allowed;
    },
  };
}
