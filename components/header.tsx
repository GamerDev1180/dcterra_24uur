"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSiteConfig } from "@/components/site-config-provider"
import { donateUrl, isEnabled } from "@/lib/site-defaults"
import { cn } from "@/lib/utils"

export function Header() {
  const config = useSiteConfig()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  const navItems = [
    { href: "/#over", label: "Over de actie", show: true },
    { href: "/register", label: "Meedoen", show: isEnabled(config, "feature_registration_enabled", true) },
    { href: "/team", label: "Vrijwilliger worden", show: isEnabled(config, "feature_team_enabled", true) },
    { href: "/schedule", label: "Programma", show: isEnabled(config, "feature_schedule_enabled") },
    { href: "/sponsors", label: "Sponsors", show: isEnabled(config, "feature_sponsors_enabled") },
    { href: "/#vragen", label: "Vragen", show: true },
  ].filter((item) => item.show)

  const isActive = (href: string) => !href.startsWith("/#") && pathname === href

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "bg-background/90 backdrop-blur-md shadow-[0_1px_0_var(--border)]"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="Naar de homepagina">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-wensstichting-drenthe.webp"
              alt={config.org_name}
              width={162}
              height={64}
              className="h-10 md:h-12 w-auto dark:brightness-110"
            />
            <span className="hidden lg:flex flex-col leading-tight border-l border-border pl-3">
              <span className="font-display font-semibold text-foreground">24 uur live</span>
              <span className="text-xs text-muted-foreground">door studenten van DCTerra</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Hoofdmenu">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-semibold transition-colors",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/80 hover:text-foreground hover:bg-muted",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="hidden sm:inline-flex rounded-full font-bold px-4">
              <a href={donateUrl(config)} target="_blank" rel="noopener noreferrer">
                <Heart className="fill-current" />
                Doneer
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobiel-menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
              <span className="sr-only">{open ? "Menu sluiten" : "Menu openen"}</span>
            </Button>
          </div>
        </div>

        {open && (
          <nav id="mobiel-menu" className="md:hidden pb-5 animate-fade-in" aria-label="Mobiel menu">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-base font-semibold",
                      isActive(item.href) ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Button asChild className="w-full rounded-xl h-12 font-bold">
                  <a href={donateUrl(config)} target="_blank" rel="noopener noreferrer">
                    <Heart className="fill-current" />
                    Doneer aan {config.org_name}
                  </a>
                </Button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}
