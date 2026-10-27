import { NextResponse } from "next/server"
import { SESSION_COOKIE_NAME } from "@/lib/auth"
import { withRoute } from "@/lib/api/response"

export const POST = withRoute(async () => {
  const response = NextResponse.json({ success: true })
  response.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 })
  return response
})
