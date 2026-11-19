/**
 * In-memory rate limiter using a sliding window counter per IP address.
 *
 * IMPORTANT — serverless caveat:
 * On Vercel each function instance has its own memory, so counters are not
 * shared across instances. This stops naive bots and accidental re-submissions
 * but cannot prevent a distributed attack that hits multiple instances.
 * For this site's threat model (spam prevention) this is sufficient.
 * A fully distributed limit would require an external store (e.g. Redis).
 */

import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";

interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Length of the sliding window in milliseconds. */
  windowMs: number;
}

interface Counter {
  count: number;
  /** Unix timestamp (ms) when the current window expires. */
  windowExpiry: number;
}

/**
 * Creates a rate limiter function. Call the returned function at the top of
 * each API route handler. It returns a 429 `NextResponse` when the limit is
 * exceeded, or `null` when the request is allowed through.
 *
 * Usage:
 *   const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 });
 *
 *   export async function POST(request: Request) {
 *     const limited = limiter(request);
 *     if (limited) return limited;
 *     // ... rest of handler
 *   }
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { limit, windowMs } = options;

  // LRUCache bounded to 500 unique IPs; each entry expires after 2× the window
  // so the cache doesn't grow unbounded under sustained traffic.
  const cache = new LRUCache<string, Counter>({
    max: 500,
    ttl: windowMs * 2,
  });

  return function checkRateLimit(request: Request): NextResponse | null {
    const ip = extractIp(request);
    const now = Date.now();

    const existing = cache.get(ip);

    if (!existing || now > existing.windowExpiry) {
      // First request in a new window.
      cache.set(ip, { count: 1, windowExpiry: now + windowMs });
      return null;
    }

    if (existing.count >= limit) {
      const retryAfterSeconds = Math.ceil((existing.windowExpiry - now) / 1000);
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(existing.windowExpiry / 1000)),
          },
        },
      );
    }

    // Increment counter within the existing window.
    cache.set(ip, { count: existing.count + 1, windowExpiry: existing.windowExpiry });
    return null;
  };
}

/**
 * Extracts the real client IP from the request headers.
 * Vercel sets `x-forwarded-for`; falls back to a fixed string for local dev
 * (where the header is absent and all requests come from the same loopback).
 */
function extractIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; the first entry is the client.
    return forwarded.split(",")[0].trim();
  }
  // Local development fallback — treat all local requests as one IP.
  return "127.0.0.1";
}
