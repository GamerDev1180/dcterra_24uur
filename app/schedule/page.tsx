import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/decor"
import { EventTimer } from "@/components/event-timer"
import { ScheduleList } from "@/components/schedule-list"
import { getSiteConfig } from "@/lib/site-config"
import { getScheduleEvents } from "@/lib/site-data"
import { isEnabled } from "@/lib/site-defaults"

export const metadata: Metadata = { title: "Programma" }

export default async function SchedulePage() {
  const config = await getSiteConfig()
  const enabled = isEnabled(config, "feature_schedule_enabled")
  const events = enabled ? await getScheduleEvents() : []

  return (
    <div className="min-h-screen">
      <Header />
      <PageHero
        eyebrow="Programma"
        title={
          <>
            24 uur vol <span className="text-primary">actie</span>
          </>
        }
        intro="Van games tot gesprekken en van muziek tot gekke challenges. Bekijk wat er wanneer gebeurt."
      />
      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {config.stream_start_time && (
            <EventTimer streamStartTime={config.stream_start_time} streamUrl={config.stream_platform_url} />
          )}
          {!enabled ? (
            <EmptyState title="Het programma volgt binnenkort" text="We zijn nog druk bezig met de planning. Kom snel terug!" />
          ) : events.length === 0 ? (
            <EmptyState title="Het programma wordt binnenkort bekendgemaakt" text="Houd deze pagina in de gaten." />
          ) : (
            <ScheduleList events={events} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-card border border-border p-8 md:p-10 text-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-muted-foreground">{text}</p>
    </div>
  )
}
