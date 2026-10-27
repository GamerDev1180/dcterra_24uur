import type { Metadata } from "next"
import { ExternalLink, Mail } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/decor"
import { Button } from "@/components/ui/button"
import { getSiteConfig } from "@/lib/site-config"
import { getSponsors } from "@/lib/site-data"
import { isEnabled } from "@/lib/site-defaults"
import type { Sponsor } from "@/lib/db"

export const metadata: Metadata = { title: "Sponsors" }

const tiers: { key: Sponsor["tier"]; label: string; tint: string }[] = [
  { key: "Platinum", label: "Platina", tint: "bg-slate-200 text-slate-800" },
  { key: "Gold", label: "Goud", tint: "bg-amber-200 text-amber-900" },
  { key: "Silver", label: "Zilver", tint: "bg-zinc-200 text-zinc-800" },
  { key: "Bronze", label: "Brons", tint: "bg-orange-200 text-orange-900" },
]

export default async function SponsorsPage() {
  const config = await getSiteConfig()
  const enabled = isEnabled(config, "feature_sponsors_enabled")
  const sponsors = enabled ? await getSponsors() : []

  return (
    <div className="min-h-screen">
      <Header />
      <PageHero
        eyebrow="Sponsors"
        title={
          <>
            Mogelijk gemaakt <span className="text-primary">door</span>
          </>
        }
        intro={`Deze bedrijven en organisaties steunen 24 uur live voor ${config.org_name}. Dank jullie wel!`}
      />
      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {!enabled || sponsors.length === 0 ? (
            <div className="rounded-3xl bg-card border border-border p-8 md:p-10 text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold">Onze sponsors worden binnenkort bekendgemaakt</h2>
              <p className="mt-2 text-muted-foreground">Kom snel terug om te zien wie er meedoet.</p>
            </div>
          ) : (
            tiers.map((tier) => {
              const list = sponsors.filter((s) => s.tier === tier.key)
              if (list.length === 0) return null
              return (
                <section key={tier.key}>
                  <h2 className="mb-5 flex items-center gap-3 text-2xl font-bold">
                    <span className={`rounded-full px-3 py-1 text-sm ${tier.tint}`}>{tier.label}</span>
                    sponsors
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((s) => (
                      <article key={s.id} className="flex flex-col rounded-3xl bg-card border border-border p-6 glow-card">
                        <div className="flex h-24 items-center justify-center rounded-2xl bg-white mb-4 p-3">
                          {s.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.logo_url} alt={`Logo ${s.name}`} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="font-display text-xl font-bold text-slate-700">{s.name}</span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold">{s.name}</h3>
                        {s.description && <p className="mt-1 text-muted-foreground flex-1">{s.description}</p>}
                        {s.contribution && <p className="mt-3 text-sm font-semibold text-primary">{s.contribution}</p>}
                        {s.website && (
                          <a
                            href={s.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                          >
                            Website <ExternalLink className="size-3.5" />
                          </a>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )
            })
          )}

          {config.contact_email && (
            <div className="rounded-3xl bg-secondary text-secondary-foreground p-8 text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold">Ook sponsor worden?</h2>
              <p className="mt-2">Wil jouw bedrijf deze actie steunen? We horen graag van je.</p>
              <Button asChild size="xl" className="mt-5">
                <a href={`mailto:${config.contact_email}?subject=Sponsor%2024%20uur%20live`}>
                  <Mail />
                  Neem contact op
                </a>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
