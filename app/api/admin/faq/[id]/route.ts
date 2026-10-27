import type { NextRequest } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, ApiError, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"
import { CACHE_TAGS, purgeCacheTag } from "@/lib/cache-tags"

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
})

export const PUT = withRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  requireAdmin(request)

  const { id } = await params
  const faqId = Number.parseInt(id, 10)
  if (Number.isNaN(faqId)) {
    throw new ApiError("Ongeldig id", 400)
  }

  const { question, answer, display_order, is_active } = await parseBody(request, faqSchema)

  await db.query("UPDATE faq_items SET question = ?, answer = ?, display_order = ?, is_active = ? WHERE id = ?", [
    question,
    answer,
    display_order,
    is_active,
    faqId,
  ])

  purgeCacheTag(CACHE_TAGS.faq)

  return apiSuccess({})
})

export const DELETE = withRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  requireAdmin(request)

  const { id } = await params
  const faqId = Number.parseInt(id, 10)
  if (Number.isNaN(faqId)) {
    throw new ApiError("Ongeldig id", 400)
  }

  await db.query("DELETE FROM faq_items WHERE id = ?", [faqId])

  purgeCacheTag(CACHE_TAGS.faq)

  return apiSuccess({})
})
