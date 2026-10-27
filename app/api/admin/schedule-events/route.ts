import type { NextRequest } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"
import { CACHE_TAGS, purgeCacheTag } from "@/lib/cache-tags"

const scheduleEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  start_time: z.string().min(1), // "YYYY-MM-DD HH:MM:SS"
  end_time: z.string().min(1),
  event_type: z.enum(["gaming", "music", "talk", "break", "special"]),
  participants: z.array(z.string()).nullable().optional(),
  display_order: z.number().int().default(0),
})

export const GET = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const events = (await db.query(`
    SELECT id, title, description, start_time, end_time, event_type, participants, display_order, is_active
    FROM schedule_events
    ORDER BY start_time ASC, display_order ASC
  `)) as any[]

  const parsedEvents = events.map((event) => ({
    ...event,
    participants: event.participants ? JSON.parse(event.participants) : [],
  }))

  return apiSuccess({ events: parsedEvents })
})

export const POST = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const { title, description, start_time, end_time, event_type, participants, display_order } = await parseBody(
    request,
    scheduleEventSchema,
  )

  await db.query(
    `INSERT INTO schedule_events (title, description, start_time, end_time, event_type, participants, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description ?? null, start_time, end_time, event_type, participants ? JSON.stringify(participants) : null, display_order],
  )

  purgeCacheTag(CACHE_TAGS.scheduleEvents)

  return apiSuccess({}, 201)
})
