import type { NextRequest } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"
import { CACHE_TAGS, purgeCacheTag } from "@/lib/cache-tags"

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  display_order: z.number().int().default(0),
})

export const GET = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const items = await db.query(`
    SELECT id, question, answer, display_order, is_active
    FROM faq_items
    ORDER BY display_order ASC
  `)

  return apiSuccess({ items })
})

export const POST = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const { question, answer, display_order } = await parseBody(request, faqSchema)

  await db.query("INSERT INTO faq_items (question, answer, display_order) VALUES (?, ?, ?)", [
    question,
    answer,
    display_order,
  ])

  purgeCacheTag(CACHE_TAGS.faq)

  return apiSuccess({}, 201)
})
