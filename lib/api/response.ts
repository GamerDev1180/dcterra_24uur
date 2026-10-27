import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

export class ApiError extends Error {
  status: number
  code?: string
  fieldErrors?: Record<string, string[] | undefined>
  retryAfterSeconds?: number

  constructor(
    message: string,
    status = 400,
    options?: { code?: string; fieldErrors?: Record<string, string[] | undefined>; retryAfterSeconds?: number },
  ) {
    super(message)
    this.status = status
    this.code = options?.code
    this.fieldErrors = options?.fieldErrors
    this.retryAfterSeconds = options?.retryAfterSeconds
  }
}

export function apiSuccess<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status })
}

export function apiError(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, error: message, code }, { status })
}

type RouteHandler = (request: NextRequest, context?: any) => Promise<Response>

/**
 * Wraps a route handler with consistent error handling: known ApiErrors (and
 * Zod validation errors) are turned into the right status code with a useful
 * client-facing message; anything unexpected is logged server-side and
 * reported to the client as a generic 500 so internals never leak.
 */
export function withRoute(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      if (error instanceof ApiError) {
        const headers: Record<string, string> = {}
        if (error.retryAfterSeconds !== undefined) {
          headers["Retry-After"] = String(error.retryAfterSeconds)
        }
        return NextResponse.json(
          { success: false, error: error.message, code: error.code, fieldErrors: error.fieldErrors },
          { status: error.status, headers },
        )
      }

      if (error instanceof ZodError) {
        return NextResponse.json(
          { success: false, error: "Niet alle gegevens zijn goed ingevuld.", fieldErrors: error.flatten().fieldErrors },
          { status: 400 },
        )
      }

      console.error("Unhandled API error:", error)
      return NextResponse.json({ success: false, error: "Er ging iets mis aan onze kant. Probeer het later opnieuw." }, { status: 500 })
    }
  }
}
