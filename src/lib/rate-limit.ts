/**
 * Minimal in-memory IP rate limiter for low-traffic form endpoints.
 * Best-effort on serverless (memory is per-instance): combined with the
 * honeypot field and validation, it stops casual abuse, not botnets.
 */
const hits = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 60 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((oldest + windowMs - now) / 1000),
    };
  }

  timestamps.push(now);
  hits.set(key, timestamps);

  // Prune idle entries so the map cannot grow without bound.
  if (hits.size > 1000) {
    for (const [k, v] of hits) {
      if (v.length === 0 || v[v.length - 1] < windowStart) {
        hits.delete(k);
      }
      if (hits.size <= 1000) break;
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
