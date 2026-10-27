import type { NextRequest } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, withRoute } from "@/lib/api/response"

export const GET = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const registrations = (await db.query(`
    SELECT
      u.id, u.name, u.email, u.on_camera, u.discord_code,
      u.status, u.registration_date, u.created_at
    FROM users u
    ORDER BY u.created_at DESC
  `)) as any[]

  for (const registration of registrations) {
    const answers = (await db.query(
      `
      SELECT q.question_text, ua.answer
      FROM user_answers ua
      JOIN questions q ON ua.question_id = q.id
      WHERE ua.user_id = ?
      ORDER BY q.order_index
    `,
      [registration.id],
    )) as any[]

    registration.answers = answers
  }

  return apiSuccess({ registrations })
})
