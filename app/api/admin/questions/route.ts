import type { NextRequest } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, withRoute } from "@/lib/api/response"
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

export const GET = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const questions = (await db.query(`
    SELECT id, question_text, question_type, options, required,
           category, order_index, active, created_at
    FROM questions
    ORDER BY category, order_index
  `)) as any[]

  const parsedQuestions = questions.map((q) => ({
    ...q,
    options: q.options ? JSON.parse(q.options) : null,
    required: Boolean(q.required),
    active: Boolean(q.active),
  }))

  return apiSuccess({ questions: parsedQuestions })
})

export const POST = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const { question_text, question_type, options, required, category, order_index, active } = await parseBody(
    request,
    questionSchema,
  )

  const optionsJson = options ? JSON.stringify(options) : null

  await db.query(
    `
    INSERT INTO questions (question_text, question_type, options, required, category, order_index, active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
    [question_text, question_type, optionsJson, required, category, order_index, active],
  )

  purgeCacheTag(CACHE_TAGS.questions)

  return apiSuccess({})
})
