import "server-only"
import { unstable_cache } from "next/cache"
import { connection } from "next/server"
import { query } from "@/lib/db"
import { CACHE_TAGS, PUBLIC_CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"
import { DEFAULT_CONFIG, type SiteConfig } from "@/lib/site-defaults"

const getCachedConfig = unstable_cache(
  async () => {
    const rows = (await query("SELECT config_key, config_value FROM event_config")) as {
      config_key: string
      config_value: string
    }[]
    const out: Record<string, string> = {}
    for (const row of rows) out[row.config_key] = row.config_value
    return out
  },
  ["site-config"],
  { tags: [CACHE_TAGS.eventConfig], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS },
)

/**
 * Loads the admin-editable event config at request time. If the database is
 * unreachable the site still renders with sensible defaults instead of
 * crashing, so the public pages always work.
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  await connection()
  try {
    const fromDb = await getCachedConfig()
    const merged: SiteConfig = { ...DEFAULT_CONFIG }
    for (const [key, value] of Object.entries(fromDb)) {
      // Empty values in the DB fall back to the default instead of blanking the site.
      if (value !== null && value !== undefined && value !== "") merged[key] = value
    }
    return merged
  } catch (error) {
    console.error("[site-config] Kon configuratie niet laden, standaardwaarden worden gebruikt:", error)
    return { ...DEFAULT_CONFIG }
  }
}
