"use client"

import { createContext, useContext, type ReactNode } from "react"
import { DEFAULT_CONFIG, type SiteConfig } from "@/lib/site-defaults"

const SiteConfigContext = createContext<SiteConfig>(DEFAULT_CONFIG)

/** Makes the server-loaded event config available to every client component without extra fetches. */
export function SiteConfigProvider({ config, children }: { config: SiteConfig; children: ReactNode }) {
  return <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>
}

export function useSiteConfig(): SiteConfig {
  return useContext(SiteConfigContext)
}
