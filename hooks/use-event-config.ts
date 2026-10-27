"use client"

import { useSiteConfig } from "@/components/site-config-provider"
import { isEnabled, type SiteConfig } from "@/lib/site-defaults"

export type EventConfig = SiteConfig

/**
 * Kept for backwards compatibility: the config is now loaded on the server in
 * app/layout.tsx and shared through context, so it is available immediately.
 */
export function useEventConfig() {
  const config = useSiteConfig()
  return { config, loading: false }
}

export function isFeatureEnabled(config: EventConfig | null, key: string, defaultValue = false): boolean {
  return isEnabled(config, key, defaultValue)
}
