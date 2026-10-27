import type { NextRequest } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { apiSuccess, withRoute } from "@/lib/api/response"

export const GET = withRoute(async (request: NextRequest) => {
  const user = requireAdmin(request)
  return apiSuccess({ user })
})
