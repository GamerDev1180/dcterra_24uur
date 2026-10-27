import { z } from "zod"

// Validated once at import time. In production, a missing required value throws
// immediately at boot instead of silently falling back to something insecure
// (the old behavior for JWT_SECRET, for example). In development, a few
// dev-only fallbacks are allowed so `pnpm dev` works without a full .env file --
// each one logs a warning so it's never a silent surprise.

const isProduction = process.env.NODE_ENV === "production"
// `next build` sets NODE_ENV=production while it statically collects route
// metadata, which imports this module before any real runtime secrets exist
// (those get injected when the container/process actually starts). Only
// enforce the strict production checks at actual runtime, not at build time,
// or `next build` can never succeed without secrets already present.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build"
const requireStrict = isProduction && !isBuildPhase

function devFallback(value: string | undefined, fallback: string, label: string): string {
  if (value) return value
  if (requireStrict) return value as unknown as string // let schema validation report the missing var
  if (!isBuildPhase) {
    console.warn(`[env] ${label} not set, using a development-only fallback. Set it before deploying.`)
  }
  return fallback
}

const rawEnv = {
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD ?? "",
  DB_NAME: process.env.DB_NAME || "livestream_event",
  DB_CONNECTION_LIMIT: process.env.DB_CONNECTION_LIMIT,
  DB_QUEUE_LIMIT: process.env.DB_QUEUE_LIMIT,
  DB_CONNECT_TIMEOUT_MS: process.env.DB_CONNECT_TIMEOUT_MS,
  JWT_SECRET: isProduction ? process.env.JWT_SECRET : devFallback(process.env.JWT_SECRET, "dev-only-insecure-secret-do-not-use-in-production", "JWT_SECRET"),
  RESEND_API_KEY: devFallback(process.env.RESEND_API_KEY, "re_dev_00000000000000000000000000", "RESEND_API_KEY"),
  EMAIL_FROM: devFallback(process.env.EMAIL_FROM, "onboarding@resend.dev", "EMAIL_FROM"),
  NODE_ENV: process.env.NODE_ENV || "development",
}

const envSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().min(1),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().default(15),
  DB_QUEUE_LIMIT: z.coerce.number().int().min(0).default(0),
  DB_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  // Not enforced here: a missing secret should only disable the admin login
  // (see getJwtSecret in lib/auth.ts), never take the public site down.
  JWT_SECRET: z.string().optional().default(""),
  RESEND_API_KEY: requireStrict
    ? z.string().min(1, "RESEND_API_KEY is required in production")
    : z.string().min(1),
  EMAIL_FROM: requireStrict ? z.email("EMAIL_FROM must be a valid address in production") : z.string().min(1),
  NODE_ENV: z.string(),
})

const parsed = envSchema.safeParse(rawEnv)

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n")
  throw new Error(`Invalid environment configuration:\n${issues}`)
}

export const env = parsed.data
