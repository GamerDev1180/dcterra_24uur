import type { NextRequest } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, ApiError, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"
import { CACHE_TAGS, purgeCacheTag } from "@/lib/cache-tags"

const scheduleEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  event_type: z.enum(["gaming", "music", "talk", "break", "special"]),
  participants: z.array(z.string()).nullable().optional(),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
})

export const PUT = withRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  requireAdmin(request)

  const { id } = await params
  const eventId = Number.parseInt(id, 10)
  if (Number.isNaN(eventId)) {
    throw new ApiError("Ongeldig id", 400)
  }

  const { title, description, start_time, end_time, event_type, participants, display_order, is_active } =
    await parseBody(request, scheduleEventSchema)

  await db.query(
    `UPDATE schedule_events
     SET title = ?, description = ?, start_time = ?, end_time = ?, event_type = ?,
         participants = ?, display_order = ?, is_active = ?
     WHERE id = ?`,
    [
      title,
      description ?? null,
      start_time,
      end_time,
      event_type,
      participants ? JSON.stringify(participants) : null,
      display_order,
      is_active,
      eventId,
    ],
  )

  purgeCacheTag(CACHE_TAGS.scheduleEvents)

  return apiSuccess({})
})

export const DELETE = withRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  requireAdmin(request)

  const { id } = await params
  const eventId = Number.parseInt(id, 10)
  if (Number.isNaN(eventId)) {
    throw new ApiError("Ongeldig id", 400)
  }

  await db.query("DELETE FROM schedule_events WHERE id = ?", [eventId])

  purgeCacheTag(CACHE_TAGS.scheduleEvents)

  return apiSuccess({})
})
