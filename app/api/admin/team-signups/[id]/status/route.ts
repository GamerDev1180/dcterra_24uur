import type { NextRequest } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, ApiError, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"

const statusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
})

export const PATCH = withRoute(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  requireAdmin(request)

  const { id } = await params
  const signupId = Number.parseInt(id, 10)
  if (Number.isNaN(signupId)) {
    throw new ApiError("Ongeldig id", 400)
  }

  const { status } = await parseBody(request, statusSchema)

  await db.query("UPDATE team_signups SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
    status,
    signupId,
  ])

  return apiSuccess({})
})
