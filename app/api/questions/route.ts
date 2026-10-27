import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { db } from "@/lib/db"
import { withRoute } from "@/lib/api/response"
import { CACHE_TAGS, PUBLIC_CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"

const getCachedQuestions = unstable_cache(
  async (category: string) => {
    const questions = (await db.query(
      `SELECT id, question_text, question_type, options, required, category, order_index
       FROM questions
       WHERE category = ? AND active = true
       ORDER BY order_index ASC`,
      [category],
    )) as any[]

    return questions.map((q) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
    }))
  },
  ["questions-by-category"],
  { tags: [CACHE_TAGS.questions], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS },
)

export const GET = withRoute(async () => {
  const parsedQuestions = await getCachedQuestions("on_camera")

  return NextResponse.json(
    { questions: parsedQuestions },
    { headers: { "Cache-Control": `public, s-maxage=${PUBLIC_CACHE_REVALIDATE_SECONDS}, stale-while-revalidate=300` } },
  )
})
