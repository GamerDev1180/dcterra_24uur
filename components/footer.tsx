"use client"

import Link from "next/link"
import { Heart, Mail, ExternalLink, MonitorPlay, MessageCircle } from "lucide-react"
import { useSiteConfig } from "@/components/site-config-provider"
import { donateUrl, isEnabled } from "@/lib/site-defaults"

export function Footer() {
  const config = useSiteConfig()
  const org = config.org_name

  const navItems = [
    { href: "/", label: "Home", show: true },
    { href: "/register", label: "Meedoen aan de stream", show: isEnabled(config, "feature_registration_enabled", true) },
    { href: "/team", label: "Vrijwilliger worden", show: isEnabled(config, "feature_team_enabled", true) },
    { href: "/schedule", label: "Programma", show: isEnabled(config, "feature_schedule_enabled") },
    { href: "/sponsors", label: "Sponsors", show: isEnabled(config, "feature_sponsors_enabled") },
  ].filter((item) => item.show)

  return (
    <footer className="relative mt-24 bg-brand-navy text-white">
      <div className="absolute -top-px left-0 right-0 h-4 bg-background wave-top rotate-180" aria-hidden />
      <div className="container mx-auto px-4 pt-16 pb-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4 max-w-sm">
            <div className="inline-flex rounded-2xl bg-white px-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-wensstichting-drenthe.webp" alt={org} width={162} height={64} className="h-12 w-auto" />
            </div>
            <p className="text-white/80 leading-relaxed">
              Een 24-uurs livestream van studenten van DCTerra. Alle opbrengsten gaan naar {org}, zodat
              kinderen in Drenthe een onvergetelijke wensdag kunnen beleven.
            </p>
            <a
              href={donateUrl(config)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-5 py-2.5 font-bold text-white hover:brightness-110 transition"
            >
              <Heart className="size-4 fill-current" />
              Doneer direct
            </a>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Navigatie</h3>
            <ul className="space-y-2.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/80 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2.5">
              {config.org_website_url && (
                <li>
                  <a
                    href={config.org_website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white"
                  >
                    <ExternalLink className="size-4" />
                    Website {org}
                  </a>
                </li>
              )}
              {config.stream_platform_url && (
                <li>
                  <a
                    href={config.stream_platform_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white"
                  >
                    <MonitorPlay className="size-4" />
                    Kijk de livestream
                  </a>
                </li>
              )}
              {config.discord_invite_link && (
                <li>
                  <a href="/discord" className="inline-flex items-center gap-2 text-white/80 hover:text-white">
                    <MessageCircle className="size-4" />
                    Onze Discord
                  </a>
                </li>
              )}
              {config.contact_email && (
                <li>
                  <a
                    href={`mailto:${config.contact_email}`}
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white break-all"
                  >
                    <Mail className="size-4 shrink-0" />
                    {config.contact_email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-white/15 pt-6 text-sm text-white/60">
          <p>
            © {new Date().getFullYear()} 24 uur live voor {org}
          </p>
          <Link href="/admin" className="hover:text-white">
            Beheer
          </Link>
        </div>
      </div>
    </footer>
  )
}
