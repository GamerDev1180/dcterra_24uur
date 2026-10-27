import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { query } from "@/lib/db"
import { withRoute } from "@/lib/api/response"
import { CACHE_TAGS, PUBLIC_CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"

// Real numbers only: confirmed registrations are a genuine COUNT(*), and funds
// raised is whatever an organizer has typed into Site Settings -- there is no
// payment integration, so it is never computed or estimated.
const getCachedLiveStats = unstable_cache(
  async () => {
    const [countRows, configRows] = await Promise.all([
      query("SELECT COUNT(*) as count FROM users WHERE status = 'confirmed'") as Promise<any[]>,
      query(
        "SELECT config_value FROM event_config WHERE config_key = 'stat_funds_raised_amount'",
      ) as Promise<any[]>,
    ])

    return {
      confirmedParticipants: countRows[0]?.count ?? 0,
      fundsRaisedAmount: configRows[0]?.config_value ?? "0",
    }
  },
  ["live-stats-public"],
  { tags: [CACHE_TAGS.liveStats, CACHE_TAGS.eventConfig], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS },
)

export const GET = withRoute(async () => {
  const stats = await getCachedLiveStats()

  return NextResponse.json(stats, {
    headers: { "Cache-Control": `public, s-maxage=${PUBLIC_CACHE_REVALIDATE_SECONDS}, stale-while-revalidate=300` },
  })
})
