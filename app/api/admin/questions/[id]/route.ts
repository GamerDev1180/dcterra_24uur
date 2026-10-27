import type { NextRequest } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, ApiError, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"
import { CACHE_TAGS, purgeCacheTag } from "@/lib/cache-tags"

const questionSchema = z.object({
  question_text: z.string().min(1),
  question_type: z.enum(["text", "textarea", "select", "radio", "checkbox"]),
  options: z.array(z.string()).nullable().optional(),
  required: z.boolean().default(true),
  category: z.enum(["on_camera", "off_camera"]),
  order_index: z.number().int().default(0),
  active: z.boolean().default(true),
})

export const PUT = withRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  requireAdmin(request)

  const { id } = await params
  const questionId = Number.parseInt(id, 10)
  if (Number.isNaN(questionId)) {
    throw new ApiError("Ongeldig id", 400)
  }

  const { question_text, question_type, options, required, category, order_index, active } = await parseBody(
    request,
    questionSchema,
  )

  const optionsJson = options ? JSON.stringify(options) : null

  await db.query(
    `
    UPDATE questions
    SET question_text = ?, question_type = ?, options = ?, required = ?,
        category = ?, order_index = ?, active = ?
    WHERE id = ?
  `,
    [question_text, question_type, optionsJson, required, category, order_index, active, questionId],
  )

  purgeCacheTag(CACHE_TAGS.questions)

  return apiSuccess({})
})

export const DELETE = withRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  requireAdmin(request)

  const { id } = await params
  const questionId = Number.parseInt(id, 10)
  if (Number.isNaN(questionId)) {
    throw new ApiError("Ongeldig id", 400)
  }

  await db.query("DELETE FROM questions WHERE id = ?", [questionId])

  purgeCacheTag(CACHE_TAGS.questions)

  return apiSuccess({})
})
