import type { Metadata } from "next"
import { Wrench, Megaphone, Coffee, CalendarCheck } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/decor"
import { TeamSignupForm } from "@/components/team-signup-form"
import { getSiteConfig } from "@/lib/site-config"
import { isEnabled } from "@/lib/site-defaults"

export const metadata: Metadata = { title: "Vrijwilliger worden" }

const roles = [
  { icon: Wrench, title: "Techniek", text: "Camera's, geluid, licht en de stream zelf.", tint: "bg-secondary text-secondary-foreground" },
  { icon: CalendarCheck, title: "Planning", text: "Programma bewaken en alles op tijd laten lopen.", tint: "bg-accent text-accent-foreground" },
  { icon: Megaphone, title: "Social media", text: "De actie verspreiden en kijkers betrekken.", tint: "bg-brand-yellow/20 text-amber-800 dark:text-brand-yellow" },
  { icon: Coffee, title: "Catering & hosting", text: "Zorgen dat iedereen 24 uur lang energie houdt.", tint: "bg-brand-green/15 text-green-800 dark:text-brand-green" },
]

export default async function TeamPage() {
  const config = await getSiteConfig()
  const enabled = isEnabled(config, "feature_team_enabled", true)

  return (
    <div className="min-h-screen">
      <Header />
      <PageHero
        eyebrow="Vrijwilliger worden"
        title={
          <>
            Help mee <span className="text-primary">achter de schermen</span>
          </>
        }
        intro={`Zonder team geen livestream. Help ons als vrijwilliger of in de organisatie, zodat we zoveel mogelijk geld ophalen voor ${config.org_name}.`}
      />

      <main className="container mx-auto px-4 pb-8">
        {enabled ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] max-w-5xl mx-auto items-start">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Waar kun je bij helpen?</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {roles.map((role) => (
                  <div key={role.title} className="flex gap-4 rounded-2xl bg-card border border-border p-4">
                    <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${role.tint}`}>
                      <role.icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-bold">{role.title}</p>
                      <p className="text-sm text-muted-foreground">{role.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Na je aanmelding nemen we contact met je op met meer informatie over de eerste bijeenkomst.
              </p>
            </div>
            <TeamSignupForm />
          </div>
        ) : (
          <div className="max-w-xl mx-auto rounded-3xl bg-card border border-border p-8 text-center">
            <h2 className="text-2xl font-bold">Aanmelden is nog niet mogelijk</h2>
            <p className="mt-2 text-muted-foreground">Kom later terug om je aan te melden als vrijwilliger.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
