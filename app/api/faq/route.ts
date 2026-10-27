import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { query } from "@/lib/db"
import { withRoute } from "@/lib/api/response"
import { CACHE_TAGS, PUBLIC_CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"

const getCachedFaqItems = unstable_cache(
  async () =>
    query(`
      SELECT id, question, answer, display_order
      FROM faq_items
      WHERE is_active = TRUE
      ORDER BY display_order ASC
    `),
  ["faq-public"],
  { tags: [CACHE_TAGS.faq], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS },
)

export const GET = withRoute(async () => {
  const items = await getCachedFaqItems()

  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": `public, s-maxage=${PUBLIC_CACHE_REVALIDATE_SECONDS}, stale-while-revalidate=300` } },
  )
})
