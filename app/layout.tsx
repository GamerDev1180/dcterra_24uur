import type React from "react"
import type { Metadata, Viewport } from "next"
import { Nunito, Fredoka } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { MotionProvider } from "@/components/motion-provider"
import { SiteConfigProvider } from "@/components/site-config-provider"
import { Toaster } from "@/components/ui/toaster"
import { getSiteConfig } from "@/lib/site-config"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()
  const org = config.org_name
  return {
    title: {
      default: `24 uur live voor ${org}`,
      template: `%s · 24 uur live voor ${org}`,
    },
    description: `Studenten van DCTerra gaan 24 uur lang live om geld op te halen voor ${org}: samen laten we kinderen in Drenthe stralen.`,
    openGraph: {
      title: `24 uur live voor ${org}`,
      description: `Kijk mee, doe mee en help kinderen in Drenthe stralen.`,
      locale: "nl_NL",
      type: "website",
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffaf5" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1729" },
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig()

  return (
    <html lang="nl" className={`${nunito.variable} ${fredoka.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="wsd-theme" disableTransitionOnChange>
          <SiteConfigProvider config={config}>
            <MotionProvider>{children}</MotionProvider>
            <Toaster />
          </SiteConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
