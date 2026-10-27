import type { NextRequest } from "next/server"
import { z } from "zod"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { apiSuccess, ApiError, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"
import { CACHE_TAGS, purgeCacheTag } from "@/lib/cache-tags"

const sponsorSchema = z.object({
  name: z.string().min(1),
  tier: z.enum(["Platinum", "Gold", "Silver", "Bronze"]),
  logo_url: z.string().max(500).nullable().optional(),
  description: z.string().nullable().optional(),
  website: z.string().max(500).nullable().optional(),
  contribution: z.string().max(255).nullable().optional(),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
})

export const PUT = withRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  requireAdmin(request)

  const { id } = await params
  const sponsorId = Number.parseInt(id, 10)
  if (Number.isNaN(sponsorId)) {
    throw new ApiError("Ongeldig sponsor-id.", 400)
  }

  const { name, tier, logo_url, description, website, contribution, display_order, is_active } = await parseBody(
    request,
    sponsorSchema,
  )

  await query(
    `
    UPDATE sponsors
    SET name = ?, tier = ?, logo_url = ?, description = ?, website = ?,
        contribution = ?, display_order = ?, is_active = ?
    WHERE id = ?
  `,
    [name, tier, logo_url ?? null, description ?? null, website ?? null, contribution ?? null, display_order, is_active, sponsorId],
  )

  purgeCacheTag(CACHE_TAGS.sponsors)

  return apiSuccess({})
})

export const DELETE = withRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  requireAdmin(request)

  const { id } = await params
  const sponsorId = Number.parseInt(id, 10)
  if (Number.isNaN(sponsorId)) {
    throw new ApiError("Ongeldig sponsor-id.", 400)
  }

  await query("DELETE FROM sponsors WHERE id = ?", [sponsorId])

  purgeCacheTag(CACHE_TAGS.sponsors)

  return apiSuccess({})
})
