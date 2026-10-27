import type { NextRequest } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { generateDiscordCode, sendRegistrationEmail, validateEmailDomain } from "@/lib/utils/email"
import { apiSuccess, ApiError, withRoute } from "@/lib/api/response"
import { parseBody } from "@/lib/api/validate"
import { rateLimit } from "@/lib/rate-limit"
import { CACHE_TAGS, purgeCacheTag } from "@/lib/cache-tags"
import { getSiteConfig } from "@/lib/site-config"
import { isRegistrationOpen } from "@/lib/site-defaults"

const registerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.email(),
  answers: z.record(z.string(), z.string()).default({}),
})

export const POST = withRoute(async (request: NextRequest) => {
  rateLimit(request, "register", { limit: 5, windowMs: 10 * 60 * 1000 })

  if (!isRegistrationOpen(await getSiteConfig())) {
    throw new ApiError("Aanmelden is op dit moment gesloten.", 403)
  }

  const { name, email, answers } = await parseBody(request, registerSchema)

  const isValidDomain = await validateEmailDomain(email)
  if (!isValidDomain) {
    throw new ApiError("Gebruik je DCTerra-mailadres (@dcterra.nl of @student.dcterra.nl).", 400)
  }

  const existingUser = (await db.query("SELECT id FROM users WHERE email = ?", [email])) as any[]

  if (existingUser.length > 0) {
    throw new ApiError("Met dit e-mailadres is al iemand aangemeld.", 409)
  }

  let discordCode = ""
  let codeExists = true

  while (codeExists) {
    discordCode = generateDiscordCode()
    const codeCheck = (await db.query("SELECT id FROM users WHERE discord_code = ?", [discordCode])) as any[]
    codeExists = codeCheck.length > 0
  }

  const connection = await db.getConnection()
  await connection.beginTransaction()

  try {
    const [userResult] = (await connection.execute(
      `INSERT INTO users (name, email, discord_code, status, on_camera)
       VALUES (?, ?, ?, 'confirmed', true)`,
      [name, email, discordCode],
    )) as any

    const userId = userResult.insertId

    for (const [questionId, answer] of Object.entries(answers)) {
      if (answer && answer.trim()) {
        await connection.execute("INSERT INTO user_answers (user_id, question_id, answer) VALUES (?, ?, ?)", [
          userId,
          Number.parseInt(questionId, 10),
          answer,
        ])
      }
    }

    await connection.commit()

    purgeCacheTag(CACHE_TAGS.liveStats)

    await sendRegistrationEmail(name, email, discordCode)

    return apiSuccess({ message: "Aanmelding gelukt", discordCode })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})
