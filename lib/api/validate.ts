import type { ZodSchema } from "zod"
import { ApiError } from "@/lib/api/response"

export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    throw new ApiError("Ongeldige aanvraag.", 400)
  }

  const result = schema.safeParse(json)
  if (!result.success) {
    throw new ApiError("Niet alle gegevens zijn goed ingevuld.", 400, { fieldErrors: result.error.flatten().fieldErrors })
  }

  return result.data
}

export function parseQuery<T>(searchParams: URLSearchParams, schema: ZodSchema<T>): T {
  const result = schema.safeParse(Object.fromEntries(searchParams))
  if (!result.success) {
    throw new ApiError("Ongeldige zoekparameters.", 400, { fieldErrors: result.error.flatten().fieldErrors })
  }
  return result.data
}
