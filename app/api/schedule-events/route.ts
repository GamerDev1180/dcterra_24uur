import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { query } from "@/lib/db"
import { withRoute } from "@/lib/api/response"
import { CACHE_TAGS, PUBLIC_CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"

const getCachedScheduleEvents = unstable_cache(
  async () => {
    const events = (await query(`
      SELECT id, title, description, start_time, end_time, event_type, participants, display_order
      FROM schedule_events
      WHERE is_active = TRUE
      ORDER BY start_time ASC, display_order ASC
    `)) as any[]

    return events.map((event) => ({
      ...event,
      participants: event.participants ? JSON.parse(event.participants) : [],
    }))
  },
  ["schedule-events-public"],
  { tags: [CACHE_TAGS.scheduleEvents], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS },
)

export const GET = withRoute(async () => {
  const events = await getCachedScheduleEvents()

  return NextResponse.json(
    { events },
    { headers: { "Cache-Control": `public, s-maxage=${PUBLIC_CACHE_REVALIDATE_SECONDS}, stale-while-revalidate=300` } },
  )
})
