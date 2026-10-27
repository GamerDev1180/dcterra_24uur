import "server-only"
import { unstable_cache } from "next/cache"
import { query, type Sponsor } from "@/lib/db"
import { CACHE_TAGS, PUBLIC_CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"

// Every loader here swallows DB errors and returns an empty result, so a
// database hiccup degrades a section instead of breaking the whole page.
async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    console.error(`[site-data] ${label} laden mislukt:`, error)
    return fallback
  }
}

export interface FaqEntry {
  id: number | string
  question: string
  answer: string
}

const faqCached = unstable_cache(
  async () =>
    (await query(
      "SELECT id, question, answer FROM faq_items WHERE is_active = TRUE ORDER BY display_order ASC",
    )) as FaqEntry[],
  ["site-faq"],
  { tags: [CACHE_TAGS.faq], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS },
)

export const getFaqItems = () => safe("FAQ", faqCached, [] as FaqEntry[])

const statsCached = unstable_cache(
  async () => {
    const rows = (await query("SELECT COUNT(*) AS count FROM users WHERE status = 'confirmed'")) as { count: number }[]
    const team = (await query("SELECT COUNT(*) AS count FROM team_signups")) as { count: number }[]
    return { participants: Number(rows[0]?.count ?? 0), volunteers: Number(team[0]?.count ?? 0) }
  },
  ["site-live-stats"],
  { tags: [CACHE_TAGS.liveStats], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS },
)

export const getLiveStats = () => safe("statistieken", statsCached, { participants: 0, volunteers: 0 })

const sponsorsCached = unstable_cache(
  async () =>
    (await query(
      "SELECT * FROM sponsors WHERE is_active = TRUE ORDER BY display_order ASC, name ASC",
    )) as Sponsor[],
  ["site-sponsors"],
  { tags: [CACHE_TAGS.sponsors], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS },
)

export const getSponsors = () => safe("sponsors", sponsorsCached, [] as Sponsor[])

export interface PublicScheduleEvent {
  id: number
  title: string
  description: string | null
  start_time: string
  end_time: string
  event_type: "gaming" | "music" | "talk" | "break" | "special"
  participants: string[]
}

const scheduleCached = unstable_cache(
  async () => {
    const rows = (await query(`
      SELECT id, title, description, start_time, end_time, event_type, participants
      FROM schedule_events
      WHERE is_active = TRUE
      ORDER BY start_time ASC, display_order ASC
    `)) as any[]
    return rows.map((row) => {
      let participants: string[] = []
      try {
        participants = row.participants ? JSON.parse(row.participants) : []
      } catch {
        participants = []
      }
      return {
        ...row,
        // Serialise dates so they survive the trip to client components.
        start_time: new Date(row.start_time).toISOString(),
        end_time: new Date(row.end_time).toISOString(),
        participants,
      } as PublicScheduleEvent
    })
  },
  ["site-schedule"],
  { tags: [CACHE_TAGS.scheduleEvents], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS },
)

export const getScheduleEvents = () => safe("programma", scheduleCached, [] as PublicScheduleEvent[])
