import type { NextRequest } from "next/server"
import { z } from "zod"
import { requireAdmin, createAdminUser } from "@/lib/auth"
import { apiSuccess, ApiError, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"

const createAdminSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(12, "Password must be at least 12 characters"),
  email: z.email(),
  role: z.enum(["admin", "super_admin"]).default("admin"),
})

export const POST = withRoute(async (request: NextRequest) => {
  requireAdmin(request, "super_admin")

  const { username, password, email, role } = await parseBody(request, createAdminSchema)

  const success = await createAdminUser(username, password, email, role)

  if (!success) {
    throw new ApiError("Beheerder aanmaken mislukt", 500)
  }

  return apiSuccess({})
})
