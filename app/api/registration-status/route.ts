import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { query } from "@/lib/db"
import { withRoute } from "@/lib/api/response"
import { CACHE_TAGS, PUBLIC_CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"
import { parseEventDate } from "@/lib/site-defaults"

const getCachedRegistrationConfig = unstable_cache(
  async () => {
    const config = (await query(`
      SELECT config_key, config_value
      FROM event_config
      WHERE config_key IN ('registration_end_time', 'registration_open', 'feature_registration_enabled')
    `)) as any[]

    return config.reduce((acc: Record<string, string>, item: any) => {
      acc[item.config_key] = item.config_value
      return acc
    }, {})
  },
  ["registration-status-config"],
  { tags: [CACHE_TAGS.eventConfig], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS },
)

export const GET = withRoute(async () => {
  const configObj = await getCachedRegistrationConfig()

  const now = new Date()
  const registrationEndTime = parseEventDate(configObj.registration_end_time)
  const registrationOpen = configObj.registration_open === "true"
  const featureEnabled = configObj.feature_registration_enabled !== "false"

  const isRegistrationOpen = featureEnabled && registrationOpen && (!registrationEndTime || now < registrationEndTime)

  return NextResponse.json(
    {
      isOpen: isRegistrationOpen,
      endTime: configObj.registration_end_time,
      manuallyDisabled: !registrationOpen,
      featureEnabled,
    },
    { headers: { "Cache-Control": `public, s-maxage=${PUBLIC_CACHE_REVALIDATE_SECONDS}, stale-while-revalidate=300` } },
  )
})
