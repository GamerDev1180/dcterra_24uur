import type { NextRequest } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, ApiError, withRoute } from "@/lib/api/response"

export const DELETE = withRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  requireAdmin(request)

  const { id } = await params
  const signupId = Number.parseInt(id, 10)
  if (Number.isNaN(signupId)) {
    throw new ApiError("Ongeldig id", 400)
  }

  await db.query("DELETE FROM team_signups WHERE id = ?", [signupId])

  return apiSuccess({})
})
