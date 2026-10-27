import { type NextRequest, NextResponse } from "next/server"
import { unstable_cache, revalidateTag } from "next/cache"
import { z } from "zod"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { apiSuccess, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"
import { CACHE_TAGS, PUBLIC_CACHE_REVALIDATE_SECONDS, purgeCacheTag } from "@/lib/cache-tags"

const updateConfigSchema = z.object({
  config_key: z.string().min(1),
  config_value: z.string(),
})

const getCachedEventConfig = unstable_cache(
  async () => {
    const config = (await query(`
      SELECT config_key, config_value, description
      FROM event_config
      ORDER BY config_key
    `)) as any[]

    return config.reduce((acc: Record<string, string>, item: any) => {
      acc[item.config_key] = item.config_value
      return acc
    }, {})
  },
  ["event-config-public"],
  { tags: [CACHE_TAGS.eventConfig], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS },
)

export const GET = withRoute(async () => {
  const configObj = await getCachedEventConfig()

  return NextResponse.json(configObj, {
    headers: { "Cache-Control": `public, s-maxage=${PUBLIC_CACHE_REVALIDATE_SECONDS}, stale-while-revalidate=300` },
  })
})

export const PUT = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const { config_key, config_value } = await parseBody(request, updateConfigSchema)

  await query(
    `
    UPDATE event_config
    SET config_value = ?, updated_at = CURRENT_TIMESTAMP
    WHERE config_key = ?
  `,
    [config_value, config_key],
  )

  purgeCacheTag(CACHE_TAGS.eventConfig)

  return apiSuccess({})
})
