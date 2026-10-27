import { type NextRequest, NextResponse } from "next/server"
import { unstable_cache, revalidateTag } from "next/cache"
import { z } from "zod"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { apiSuccess, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"
import { CACHE_TAGS, PUBLIC_CACHE_REVALIDATE_SECONDS, purgeCacheTag } from "@/lib/cache-tags"

const sponsorSchema = z.object({
  name: z.string().min(1),
  tier: z.enum(["Platinum", "Gold", "Silver", "Bronze"]),
  logo_url: z.string().max(500).nullable().optional(),
  description: z.string().nullable().optional(),
  website: z.string().max(500).nullable().optional(),
  contribution: z.string().max(255).nullable().optional(),
  display_order: z.number().int().default(0),
})

const getCachedSponsors = unstable_cache(
  async () =>
    query(`
      SELECT * FROM sponsors
      WHERE is_active = TRUE
      ORDER BY display_order ASC, tier DESC, name ASC
    `),
  ["sponsors-public-list"],
  { tags: [CACHE_TAGS.sponsors], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS },
)

export const GET = withRoute(async () => {
  const sponsors = await getCachedSponsors()

  return NextResponse.json(
    { sponsors },
    { headers: { "Cache-Control": `public, s-maxage=${PUBLIC_CACHE_REVALIDATE_SECONDS}, stale-while-revalidate=300` } },
  )
})

export const POST = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const { name, tier, logo_url, description, website, contribution, display_order } = await parseBody(
    request,
    sponsorSchema,
  )

  const result = (await query(
    `
    INSERT INTO sponsors (name, tier, logo_url, description, website, contribution, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
    [name, tier, logo_url ?? null, description ?? null, website ?? null, contribution ?? null, display_order],
  )) as any

  purgeCacheTag(CACHE_TAGS.sponsors)

  return apiSuccess({ id: result.insertId }, 201)
})
