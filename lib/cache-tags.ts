import { revalidateTag } from "next/cache"

// Shared cache tag names for the read-heavy public GET endpoints. Admin write
// routes call purgeCacheTag(...) with these same names after a successful
// write so the public pages never serve stale data for longer than one
// `revalidate` window.

export const CACHE_TAGS = {
  eventConfig: "event-config",
  sponsors: "sponsors",
  scheduleEvents: "schedule-events",
  questions: "questions",
  liveStats: "live-stats",
  faq: "faq",
} as const

// How long a cached response can be served before Next re-fetches it (seconds).
export const PUBLIC_CACHE_REVALIDATE_SECONDS = 60

/**
 * Purges a cache tag from a Route Handler. Next's revalidateTag() takes a
 * required "profile" second argument (a named cacheLife profile or an
 * { expire } config); { expire: 1 } asks for the shortest possible lifetime,
 * which is the closest equivalent to "purge immediately" outside a Server
 * Action (where updateTag() would otherwise apply).
 */
export function purgeCacheTag(tag: string) {
  revalidateTag(tag, { expire: 1 })
}
