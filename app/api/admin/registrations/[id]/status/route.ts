import type { NextRequest } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, ApiError, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"
import { CACHE_TAGS, purgeCacheTag } from "@/lib/cache-tags"

const statusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
})

export const PATCH = withRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  requireAdmin(request)

  const { id } = await params
  const userId = Number.parseInt(id, 10)
  if (Number.isNaN(userId)) {
    throw new ApiError("Ongeldig id", 400)
  }

  const { status } = await parseBody(request, statusSchema)

  await db.query("UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, userId])

  purgeCacheTag(CACHE_TAGS.liveStats)

  return apiSuccess({})
})
