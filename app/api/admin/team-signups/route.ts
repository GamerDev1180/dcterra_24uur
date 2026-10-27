import type { NextRequest } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, withRoute } from "@/lib/api/response"

export const GET = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const signups = await db.query(`
    SELECT id, type, name, organization_name, email, phone, message, discord_naam, status, created_at
    FROM team_signups
    ORDER BY created_at DESC
  `)

  return apiSuccess({ signups })
})
