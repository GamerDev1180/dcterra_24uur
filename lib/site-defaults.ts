// Shared between server and client: default site content and small helpers.

export type SiteConfig = Record<string, string>

export const DEFAULT_CONFIG: SiteConfig = {
  org_name: "Wensstichting Drenthe",
  org_website_url: "https://wensstichtingdrenthe.nl",
  org_description:
    "Wensstichting Drenthe vervult wensen van kinderen van 4 tot en met 17 jaar uit Drenthe die een zwaar leven hebben.",
  event_title: "24 uur live voor Wensstichting Drenthe",
  event_venue: "DCTerra, Assen",
  stream_start_time: "",
  registration_end_time: "",
  registration_open: "true",
  feature_registration_enabled: "true",
  feature_team_enabled: "true",
  feature_schedule_enabled: "false",
  feature_sponsors_enabled: "false",
  feature_faq_enabled: "true",
  stream_platform_url: "",
  discord_invite_link: "",
  contact_email: "",
  stat_funds_raised_amount: "0",
  stat_funds_goal_amount: "0",
  stat_expected_participants: "0",
}

export const DONATE_URL = "https://wensstichtingdrenthe.nl/doneren"

export function isEnabled(config: SiteConfig | null | undefined, key: string, fallback = false): boolean {
  const value = config?.[key]
  if (value === undefined || value === "") return fallback
  return value === "true"
}

const TIME_ZONE = "Europe/Amsterdam"

/** Minutes that Amsterdam is ahead of UTC at the given instant (60 or 120). */
function amsterdamOffsetMinutes(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(at)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"))
  return Math.round((asUtc - at.getTime()) / 60000)
}

/**
 * Parses the "YYYY-MM-DD HH:MM:SS" strings stored in event_config as Dutch
 * local time. Works the same on the server (often UTC) and in every browser
 * (Safari rejects the plain `new Date("2026-12-16 10:00:00")` form).
 */
export function parseEventDate(value: string | undefined | null): Date | null {
  if (!value) return null
  const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/)
  if (!m) {
    const fallback = new Date(value)
    return Number.isNaN(fallback.getTime()) ? null : fallback
  }
  const [, y, mo, d, h, mi, s] = m
  const naiveUtc = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s || 0))
  const offset = amsterdamOffsetMinutes(new Date(naiveUtc))
  return new Date(naiveUtc - offset * 60000)
}

export function formatEventDate(value: string | undefined | null, withTime = true): string | null {
  const date = parseEventDate(value)
  if (!date) return null
  return date.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: TIME_ZONE,
  })
}

/** Returns a number-ish stat for display, or null when it was never filled in. */
export function statValue(value: string | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (trimmed === "" || trimmed === "0" || trimmed === "€0") return null
  return trimmed
}

export function formatEuro(value: string | null): string | null {
  if (!value) return null
  if (value.includes("€")) return value
  const n = Number(value.replace(/\./g, "").replace(",", "."))
  if (Number.isNaN(n)) return value
  return n.toLocaleString("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
}

export function isRegistrationOpen(config: SiteConfig, now = new Date()): boolean {
  if (!isEnabled(config, "feature_registration_enabled", true)) return false
  if (config.registration_open !== "true") return false
  const end = parseEventDate(config.registration_end_time)
  return end ? now < end : true
}

export function donateUrl(config: SiteConfig): string {
  const base = config.org_website_url?.replace(/\/$/, "")
  return base && base.includes("wensstichtingdrenthe") ? `${base}/doneren` : DONATE_URL
}
