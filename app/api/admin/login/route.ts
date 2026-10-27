import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { authenticateAdmin, generateToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth"
import { ApiError, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"
import { rateLimit } from "@/lib/rate-limit"
import { env } from "@/lib/env"

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export const POST = withRoute(async (request: NextRequest) => {
  rateLimit(request, "admin-login", { limit: 5, windowMs: 5 * 60 * 1000 })

  const { username, password } = await parseBody(request, loginSchema)

  const user = await authenticateAdmin(username, password)

  if (!user) {
    throw new ApiError("Onjuiste gebruikersnaam of wachtwoord", 401)
  }

  const token = generateToken(user)

  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  })

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  return response
})
