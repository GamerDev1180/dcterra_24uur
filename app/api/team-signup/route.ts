import type { NextRequest } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { apiSuccess, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"
import { rateLimit } from "@/lib/rate-limit"

const teamSignupSchema = z
  .object({
    type: z.enum(["vrijwilliger", "organisatie"]),
    name: z.string().min(1, "Naam is verplicht").max(255),
    organizationName: z.string().max(255).optional(),
    email: z.email("Ongeldig e-mailadres"),
    phone: z.string().max(50).optional(),
    message: z.string().max(2000).optional(),
    discordNaam: z.string().min(1, "Discord naam is verplicht").max(255),
  })

export const POST = withRoute(async (request: NextRequest) => {
  // rateLimit(request, "team-signup", { limit: 5, windowMs: 10 * 60 * 1000 })

  const { type, name, organizationName, email, phone, message, discordNaam } = await parseBody(request, teamSignupSchema)

  await db.query(
    `INSERT INTO team_signups (type, name, organization_name, email, phone, message, discord_naam)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [type, name, organizationName || null, email, phone || null, message || null, discordNaam],
  )

  return apiSuccess({ message: "Aanmelding succesvol ontvangen" })
})
