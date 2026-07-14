/**
 * Simple in-memory rate limiter.
 * For production, consider using Upstash Redis or a persistent store.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  /** Max number of requests within the window */
  limit: number;
  /** Window duration in seconds */
  windowSec: number;
  /** Unique identifier for the rate limit bucket (e.g. "login") */
  bucket: string;
}

/**
 * Check if a request should be rate-limited.
 * Returns `{ allowed: false }` if the limit is exceeded.
 */
export function checkRateLimit(
  ip: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetInSec: number } {
  const key = `${options.bucket}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // First request or window expired — start a new window
    const resetAt = now + options.windowSec * 1000;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetInSec: options.windowSec,
    };
  }

  if (entry.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: options.limit - entry.count,
    resetInSec: Math.ceil((entry.resetAt - now) / 1000),
  };
}

/** Extract client IP from request headers */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

// Predefined rate-limit configs for different endpoints
export const RL_LOGIN: RateLimitOptions = {
  limit: 10,
  windowSec: 60,
  bucket: "login",
};

export const RL_ORDER: RateLimitOptions = {
  limit: 5,
  windowSec: 60,
  bucket: "order",
};

export const RL_AUTH_CHECK: RateLimitOptions = {
  limit: 15,
  windowSec: 60,
  bucket: "auth-check",
};

export const RL_ADMIN_LOGIN: RateLimitOptions = {
  limit: 5,
  windowSec: 60,
  bucket: "admin-login",
};
