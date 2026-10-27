import { type NextRequest, NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { query } from "@/lib/db"
import { CACHE_TAGS, PUBLIC_CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags"

// Short link (/discord) so we can hand out one stable URL instead of the raw
// invite link, which changes whenever an admin rotates it in event_config.
const getDiscordInviteLink = unstable_cache(
  async () => {
    const rows = (await query(
      `SELECT config_value FROM event_config WHERE config_key = 'discord_invite_link'`,
    )) as any[]

    return rows[0]?.config_value || ""
  },
  ["discord-invite-link"],
  { tags: [CACHE_TAGS.eventConfig], revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS },
)

export async function GET(request: NextRequest) {
  const inviteLink = await getDiscordInviteLink()

  let target: URL | null = null
  try {
    target = inviteLink ? new URL(inviteLink) : null
  } catch {
    target = null
  }

  // event_config is admin-editable free text -- if it's empty, malformed, or
  // (as happened once) accidentally set to this site's own /discord URL,
  // fall back to "/" instead of redirecting into a loop.
  if (!target || target.origin === request.nextUrl.origin) {
    if (target) {
      console.error(`discord_invite_link is misconfigured (points back at this site): ${inviteLink}`)
    }
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.redirect(target)
}
