// In-memory sliding-window rate limiter, keyed by IP + route.
//
// This works because next.config.mjs uses `output: "standalone"` -- the app
// runs as one long-lived Node process per instance, not a per-request
// serverless function, so an in-process Map persists correctly between
// requests on that instance.
//
// Tradeoff: state is per-instance, not shared across multiple app instances
// behind a load balancer. If this app is ever scaled horizontally, Cloudflare
// Rate Limiting Rules must be the cross-instance backstop -- this limiter is
// defense-in-depth for the database layer specifically, which Cloudflare
// cannot see into.

import { ApiError } from "@/lib/api/response"

interface Bucket {
  count: number
  windowStart: number
}

const buckets = new Map<string, Bucket>()

// Periodically drop old buckets so this Map doesn't grow forever.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000
setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > CLEANUP_INTERVAL_MS) {
      buckets.delete(key)
    }
  }
}, CLEANUP_INTERVAL_MS).unref?.()

function getClientIp(request: Request): string {
  const headers = request.headers
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  )
}

/**
 * Throws a 429 ApiError once `limit` requests have been made for this
 * route+IP within `windowMs`. Call at the top of a route handler, before any
 * DB work, so abusive traffic never reaches the database.
 */
export function rateLimit(request: Request, routeName: string, { limit, windowMs }: { limit: number; windowMs: number }) {
  const ip = getClientIp(request)
  const key = `${routeName}:${ip}`
  const now = Date.now()

  const bucket = buckets.get(key)

  if (!bucket || now - bucket.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now })
    return
  }

  bucket.count += 1

  if (bucket.count > limit) {
    const retryAfterSeconds = Math.ceil((bucket.windowStart + windowMs - now) / 1000)
    throw new ApiError("Te veel pogingen achter elkaar. Wacht even en probeer het opnieuw.", 429, {
      code: "RATE_LIMITED",
      retryAfterSeconds,
    })
  }
}
