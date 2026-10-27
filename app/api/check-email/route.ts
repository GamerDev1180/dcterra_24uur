import type { NextRequest } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { validateEmailDomain } from "@/lib/utils/email"
import { apiSuccess, ApiError, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"
import { rateLimit } from "@/lib/rate-limit"

const checkEmailSchema = z.object({
  email: z.email(),
})

export const POST = withRoute(async (request: NextRequest) => {
  rateLimit(request, "check-email", { limit: 20, windowMs: 10 * 60 * 1000 })

  const { email } = await parseBody(request, checkEmailSchema)

  const isValidDomain = await validateEmailDomain(email)
  if (!isValidDomain) {
    throw new ApiError("Gebruik je DCTerra-mailadres (@dcterra.nl of @student.dcterra.nl).", 400)
  }

  const result = (await db.query("SELECT id FROM users WHERE email = ?", [email])) as any[]

  return apiSuccess({ exists: result.length > 0 })
})
