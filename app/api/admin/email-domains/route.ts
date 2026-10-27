import type { NextRequest } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { apiSuccess, ApiError, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"

const domainSchema = z.object({
  domain: z
    .string()
    .min(2)
    .max(255)
    .startsWith("@", "Domain must start with @"),
})

export const GET = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const domains = (await db.query(
    "SELECT id, domain, created_at FROM allowed_domains ORDER BY created_at DESC",
  )) as any[]

  return apiSuccess({ domains })
})

export const POST = withRoute(async (request: NextRequest) => {
  requireAdmin(request)

  const { domain } = await parseBody(request, domainSchema)

  const existing = (await db.query("SELECT id FROM allowed_domains WHERE domain = ?", [domain])) as any[]

  if (existing.length > 0) {
    throw new ApiError("Dit domein bestaat al", 409)
  }

  await db.query("INSERT INTO allowed_domains (domain) VALUES (?)", [domain])

  return apiSuccess({})
})
