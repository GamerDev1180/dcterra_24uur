import type { NextRequest } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, withRoute } from "@/lib/api/response"
import { CACHE_TAGS, purgeCacheTag } from "@/lib/cache-tags"

// Archives all registrations and team signups (never destroyed, just moved to
// the *_archive tables) then clears the live tables so organizers can start a
// fresh cycle next year without a developer. Sponsors, questions, event_config,
// schedule_events, faq_items and allowed_domains are intentionally untouched.
export const POST = withRoute(async (request: NextRequest) => {
  requireAdmin(request, "super_admin")

  const archivedYear = new Date().getFullYear()
  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()

    await connection.execute(
      `INSERT INTO users_archive (id, name, email, on_camera, discord_code, registration_date, status, created_at, updated_at, archived_year)
       SELECT id, name, email, on_camera, discord_code, registration_date, status, created_at, updated_at, ?
       FROM users`,
      [archivedYear],
    )
    await connection.execute(
      `INSERT INTO user_answers_archive (id, user_id, question_id, answer, created_at, archived_year)
       SELECT id, user_id, question_id, answer, created_at, ?
       FROM user_answers`,
      [archivedYear],
    )
    await connection.execute(
      `INSERT INTO team_signups_archive (id, type, name, organization_name, email, phone, message, status, created_at, updated_at, archived_year)
       SELECT id, type, name, organization_name, email, phone, message, status, created_at, updated_at, ?
       FROM team_signups`,
      [archivedYear],
    )

    // user_answers has a FK to users with ON DELETE CASCADE, so this also
    // clears user_answers.
    await connection.execute("DELETE FROM users")
    await connection.execute("DELETE FROM team_signups")

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }

  purgeCacheTag(CACHE_TAGS.liveStats)

  return apiSuccess({ archivedYear })
})
