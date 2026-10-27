import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MessageCircle, Video, Lock, ArrowLeft, HeartHandshake } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/decor"
import { RegistrationFlow } from "@/components/registration-flow"
import { EventTimer } from "@/components/event-timer"
import { Button } from "@/components/ui/button"
import { getSiteConfig } from "@/lib/site-config"
import { formatEventDate, isEnabled, isRegistrationOpen } from "@/lib/site-defaults"

export const metadata: Metadata = { title: "Meedoen aan de stream" }

export default async function RegisterPage() {
  const config = await getSiteConfig()
  const open = isRegistrationOpen(config)
  const teamEnabled = isEnabled(config, "feature_team_enabled", true)
  const regEnd = formatEventDate(config.registration_end_time)

  return (
    <div className="min-h-screen">
      <Header />
      <PageHero
        eyebrow="Meedoen aan de stream"
        title={
          <>
            Kom in beeld voor <span className="text-primary">{config.org_name}</span>
          </>
        }
        intro="Game, presenteer, zing of bedenk een challenge. Meld je aan als student of medewerker van DCTerra en maak de 24 uur samen onvergetelijk."
      />

      <main className="container mx-auto px-4 pb-8">
        {open ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px] max-w-5xl mx-auto items-start">
            <RegistrationFlow />

            <aside className="space-y-4 lg:sticky lg:top-28">
              <div className="rounded-3xl bg-card border border-border p-6">
                <h2 className="text-lg font-bold mb-4">Hoe het werkt</h2>
                <ol className="space-y-4 text-sm">
                  <li className="flex gap-3">
                    <Video className="size-5 shrink-0 text-brand-pink" />
                    <span>Vul je naam en je DCTerra-mailadres in en beantwoord een paar korte vragen.</span>
                  </li>
                  <li className="flex gap-3">
                    <Mail className="size-5 shrink-0 text-brand-blue" />
                    <span>Je ontvangt direct een bevestiging met je persoonlijke Discord-code.</span>
                  </li>
                  <li className="flex gap-3">
                    <MessageCircle className="size-5 shrink-0 text-brand-green" />
                    <span>Op onze Discord stemmen we het programma en jouw tijdslot af.</span>
                  </li>
                </ol>
              </div>
              {regEnd && (
                <p className="rounded-2xl bg-accent text-accent-foreground px-5 py-4 text-sm font-semibold">
                  Aanmelden kan tot {regEnd}.
                </p>
              )}
            </aside>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-3xl bg-card border border-border p-8 md:p-10 text-center">
              <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground mb-5">
                <Lock className="size-6" />
              </span>
              <h2 className="text-2xl md:text-3xl font-bold">Aanmelden is gesloten</h2>
              <p className="mt-3 text-muted-foreground text-lg">
                Op dit moment kun je je niet aanmelden om mee te doen aan de stream. Je kunt natuurlijk nog steeds
                meekijken en doneren!
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="xl" variant="outline">
                  <Link href="/">
                    <ArrowLeft />
                    Terug naar home
                  </Link>
                </Button>
                {teamEnabled && (
                  <Button asChild size="xl">
                    <Link href="/team">
                      <HeartHandshake />
                      Word vrijwilliger
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            {config.stream_start_time && (
              <EventTimer
                className="mt-6"
                streamStartTime={config.stream_start_time}
                streamUrl={config.stream_platform_url}
              />
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
