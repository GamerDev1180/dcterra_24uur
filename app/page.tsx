import type { ReactNode } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Heart,
  HeartHandshake,
  MonitorPlay,
  Video,
  Calendar,
  MapPin,
  Users,
  Gift,
  Sparkles,
  Clock,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EventTimer } from "@/components/event-timer"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal"
import { StarShape, SectionHeading } from "@/components/decor"
import { getSiteConfig } from "@/lib/site-config"
import { getFaqItems, getLiveStats, type FaqEntry } from "@/lib/site-data"
import {
  donateUrl,
  formatEuro,
  formatEventDate,
  isEnabled,
  isRegistrationOpen,
  statValue,
} from "@/lib/site-defaults"

const DEFAULT_FAQ = (org: string): FaqEntry[] => [
  {
    id: "wat",
    question: "Wat is 24 uur live?",
    answer: `Studenten van DCTerra gaan 24 uur lang non-stop live met games, challenges, muziek, gesprekken en verrassingen. Kijkers kunnen tijdens de stream doneren. Alles wat we ophalen gaat naar ${org}.`,
  },
  {
    id: "doel",
    question: `Wat doet ${org} met het geld?`,
    answer: `${org} vervult wensen van kinderen van 4 tot en met 17 jaar uit Drenthe die een zwaar leven hebben: kinderen die zelf ernstig ziek zijn, of van wie een ouder, broer of zus ziek is. Elke donatie helpt om een wensdag mogelijk te maken.`,
  },
  {
    id: "wie",
    question: "Wie kan meedoen aan de stream?",
    answer:
      "Studenten en medewerkers van DCTerra kunnen zich aanmelden met hun @dcterra.nl- of @student.dcterra.nl-adres. Na je aanmelding krijg je een e-mail met een persoonlijke code voor onze Discord, waar we alles verder afstemmen.",
  },
  {
    id: "vrijwilliger",
    question: "Ik wil niet voor de camera. Kan ik toch helpen?",
    answer:
      "Zeker! Achter de schermen hebben we hulp nodig bij techniek, planning, social media, catering en meer. Meld je aan via de pagina 'Vrijwilliger worden', dan nemen we contact met je op.",
  },
  {
    id: "doneren",
    question: "Hoe kan ik doneren?",
    answer: `Je kunt nu al direct doneren via de website van ${org}. Tijdens de livestream delen we ook een donatielink in beeld.`,
  },
]

export default async function HomePage() {
  const config = await getSiteConfig()
  const org = config.org_name
  const [dbFaq, stats] = await Promise.all([
    isEnabled(config, "feature_faq_enabled", true) ? getFaqItems() : Promise.resolve([]),
    getLiveStats(),
  ])
  const faq = dbFaq.length > 0 ? dbFaq : DEFAULT_FAQ(org)

  const regFeature = isEnabled(config, "feature_registration_enabled", true)
  const regOpen = isRegistrationOpen(config)
  const teamEnabled = isEnabled(config, "feature_team_enabled", true)
  const donate = donateUrl(config)
  const startLabel = formatEventDate(config.stream_start_time)
  const goal = formatEuro(statValue(config.stat_funds_goal_amount))
  const raised = formatEuro(statValue(config.stat_funds_raised_amount))
  const expected = statValue(config.stat_expected_participants)

  const statItems = [
    { icon: Clock, value: "24", label: "uur non-stop live", color: "text-brand-pink" },
    stats.participants > 0
      ? { icon: Users, value: String(stats.participants), label: "aanmeldingen", color: "text-brand-blue" }
      : expected
        ? { icon: Users, value: expected, label: "verwachte deelnemers", color: "text-brand-blue" }
        : null,
    raised
      ? { icon: Heart, value: raised, label: "opgehaald", color: "text-brand-green" }
      : goal
        ? { icon: Heart, value: goal, label: "ons doel", color: "text-brand-green" }
        : { icon: Gift, value: "4–17", label: "jaar: voor deze kinderen", color: "text-brand-green" },
    { icon: Sparkles, value: "100%", label: "naar het goede doel", color: "text-brand-navy dark:text-brand-blue" },
  ].filter(Boolean) as { icon: typeof Clock; value: string; label: string; color: string }[]

  const helpCards = [
    regFeature && {
      icon: Video,
      title: "Doe mee voor de camera",
      text: "Game, presenteer, zing of bedenk een challenge. Ben je student of medewerker van DCTerra? Meld je aan!",
      href: "/register",
      cta: regOpen ? "Aanmelden" : "Bekijk info",
      external: false,
      tint: "bg-accent text-accent-foreground",
    },
    teamEnabled && {
      icon: HeartHandshake,
      title: "Help achter de schermen",
      text: "Techniek, planning, social media of catering: zonder vrijwilligers geen livestream.",
      href: "/team",
      cta: "Word vrijwilliger",
      external: false,
      tint: "bg-secondary text-secondary-foreground",
    },
    {
      icon: MonitorPlay,
      title: "Kijk en deel",
      text: "Kijk mee tijdens de stream, stuur berichten en deel de link met familie en vrienden.",
      href: config.stream_platform_url || "#praktisch",
      cta: config.stream_platform_url ? "Naar het kanaal" : "Praktische info",
      external: Boolean(config.stream_platform_url),
      tint: "bg-brand-yellow/20 text-amber-800 dark:text-brand-yellow",
    },
    {
      icon: Heart,
      title: "Doneer",
      text: `Elke euro helpt ${org} om een wens van een kind uit Drenthe te laten uitkomen.`,
      href: donate,
      cta: "Doneer nu",
      external: true,
      tint: "bg-brand-green/15 text-green-800 dark:text-brand-green",
    },
  ].filter(Boolean) as {
    icon: typeof Heart
    title: string
    text: string
    href: string
    cta: string
    external: boolean
    tint: string
  }[]

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden -mt-16 md:-mt-20 pt-16 md:pt-20">
        <div className="absolute inset-0 bg-mesh" aria-hidden />
        <div className="absolute inset-0 bg-grid opacity-70" aria-hidden />
        <StarShape className="absolute top-28 left-[6%] size-8 text-brand-yellow animate-twinkle hidden md:block" />
        <StarShape
          className="absolute top-52 right-[7%] size-6 text-brand-pink animate-twinkle hidden md:block"
          style={{ animationDelay: "0.8s" }}
        />
        <StarShape
          className="absolute bottom-24 left-[12%] size-5 text-brand-blue animate-twinkle hidden md:block"
          style={{ animationDelay: "1.6s" }}
        />
        <StarShape
          className="absolute bottom-40 right-[18%] size-4 text-brand-green animate-twinkle hidden lg:block"
          style={{ animationDelay: "2.2s" }}
        />

        <div className="relative container mx-auto px-4 pt-10 pb-16 md:pt-16 md:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <p className="inline-flex flex-wrap justify-center items-center gap-2 rounded-full bg-card/80 backdrop-blur border border-border px-4 py-1.5 text-sm font-bold mb-6 shadow-sm">
              <span className="text-brand-navy dark:text-brand-blue">DCTerra</span>
              <Heart className="size-3.5 text-brand-pink fill-current" />
              <span className="text-brand-pink">{org}</span>
            </p>

            <h1 className="text-[2.6rem] leading-[1.05] sm:text-6xl md:text-7xl font-bold text-balance">
              24 uur live om kinderen te laten{" "}
              <span className="whitespace-nowrap text-primary">
                stralen
                <StarShape className="inline-block align-top ml-1 size-5 md:size-8 text-brand-yellow animate-float" />
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Studenten van DCTerra gaan een etmaal lang non-stop live. Met games, challenges en een hoop gezelligheid
              halen we geld op voor {org}, dat wensen vervult van kinderen uit Drenthe die het zwaar hebben.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              {regFeature && regOpen && (
                <Button asChild size="xl" className="shadow-lg shadow-primary/25">
                  <Link href="/register">
                    Doe mee aan de stream
                    <ArrowRight />
                  </Link>
                </Button>
              )}
              {teamEnabled && (
                <Button asChild size="xl" variant={regFeature && regOpen ? "outline" : "default"} className="bg-card">
                  <Link href="/team">
                    <HeartHandshake />
                    Word vrijwilliger
                  </Link>
                </Button>
              )}
              <Button asChild size="xl" variant="ghost">
                <a href={donate} target="_blank" rel="noopener noreferrer">
                  <Heart className="text-brand-pink" />
                  Doneer
                </a>
              </Button>
            </div>

            {config.stream_start_time && (
              <Reveal delay={0.1} className="mt-12 max-w-2xl mx-auto">
                <EventTimer
                  streamStartTime={config.stream_start_time}
                  registrationEndTime={config.registration_end_time}
                  registrationOpen={regOpen}
                  streamUrl={config.stream_platform_url}
                />
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-4 relative z-10">
        <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
          {statItems.map((s) => (
            <StaggerItem key={s.label}>
              <div className="h-full rounded-3xl bg-card border border-border p-5 md:p-6 text-center glow-card">
                <s.icon className={`size-6 mx-auto mb-2 ${s.color}`} />
                <div className={`font-display text-3xl md:text-4xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-muted-foreground font-semibold mt-1">{s.label}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Over */}
      <section id="over" className="scroll-mt-24 container mx-auto px-4 py-20 md:py-28">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-2 items-center max-w-6xl mx-auto">
          <Reveal>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
              <StarShape className="size-4 text-brand-yellow" />
              Waarom we dit doen
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-balance">Wij laten kinderen stralen</h2>
            <div className="mt-6 space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">{org}</strong> vervult wensen van kinderen van 4 tot en met 17
                jaar uit Drenthe die een zwaar leven hebben. Dat zijn kinderen die zelf ernstig ziek zijn, maar ook
                kinderen van wie een ouder, broer of zus ziek is.
              </p>
              <p>
                Een dag naar een pretpark, een ontmoeting met een idool of gewoon even helemaal zorgeloos zijn: een
                wensdag geeft deze kinderen een herinnering om op terug te vallen. De stichting draait volledig op
                vrijwilligers, en elke donatie gaat naar het vervullen van wensen.
              </p>
            </div>
            {config.org_website_url && (
              <a
                href={config.org_website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 font-bold text-primary hover:underline underline-offset-4"
              >
                Meer over {org}
                <ArrowRight className="size-4" />
              </a>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-brand-pink/20 via-brand-yellow/20 to-brand-blue/20 -rotate-2" aria-hidden />
              <div className="relative rounded-[2rem] bg-card border border-border p-7 md:p-9 shadow-xl">
                <h3 className="text-2xl font-bold mb-5">Zo werkt de livestream</h3>
                <ol className="space-y-5">
                  {[
                    {
                      t: "24 uur non-stop live",
                      d: `Vanaf ${startLabel ?? "de startdatum"} zenden we een etmaal lang uit vanaf ${config.event_venue}.`,
                    },
                    { t: "Games, challenges en meer", d: "Studenten en docenten vullen het programma met van alles: van gaming tot gekke uitdagingen." },
                    { t: "Kijkers doneren", d: "Tijdens de stream kun je doneren. Bij mijlpalen gebeuren er natuurlijk extra leuke dingen." },
                    { t: `Alles naar ${org}`, d: "Het opgehaalde bedrag gaat volledig naar het vervullen van wensen." },
                  ].map((step, i) => (
                    <li key={step.t} className="flex gap-4">
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full font-display font-bold text-white ${
                          ["bg-brand-pink", "bg-brand-blue", "bg-brand-green", "bg-brand-navy"][i]
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-bold">{step.t}</p>
                        <p className="text-muted-foreground">{step.d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Help mee */}
      <section className="bg-muted/60 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <Reveal>
            <SectionHeading
              eyebrow="Help mee"
              title="Iedereen kan iets doen"
              intro="Of je nu voor de camera wilt, liever achter de schermen helpt of gewoon meekijkt: elke bijdrage telt."
            />
          </Reveal>
          <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {helpCards.map((card) => (
              <StaggerItem key={card.title} className="h-full">
                <div className="group h-full flex flex-col rounded-3xl bg-card border border-border p-6 glow-card hover:-translate-y-1">
                  <span className={`inline-flex size-12 items-center justify-center rounded-2xl ${card.tint}`}>
                    <card.icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{card.title}</h3>
                  <p className="mt-2 text-muted-foreground flex-1">{card.text}</p>
                  {card.external ? (
                    <a
                      href={card.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-1.5 font-bold text-primary"
                    >
                      {card.cta}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  ) : (
                    <Link href={card.href} className="mt-5 inline-flex items-center gap-1.5 font-bold text-primary">
                      {card.cta}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Praktisch */}
      <section id="praktisch" className="scroll-mt-24 container mx-auto px-4 py-20 md:py-28">
        <Reveal>
          <SectionHeading eyebrow="Praktisch" title="Wanneer, waar en hoe" />
        </Reveal>
        <StaggerGroup className="grid gap-5 md:grid-cols-3 max-w-5xl mx-auto">
          <StaggerItem>
            <InfoCard icon={Calendar} title="Wanneer" tint="text-brand-pink">
              {startLabel ? (
                <>
                  Start op <strong className="text-foreground">{startLabel}</strong>, daarna 24 uur
                  aan één stuk door.
                </>
              ) : (
                "De datum wordt binnenkort bekendgemaakt."
              )}
            </InfoCard>
          </StaggerItem>
          <StaggerItem>
            <InfoCard icon={MapPin} title="Waar" tint="text-brand-blue">
              We zenden uit vanaf <strong className="text-foreground">{config.event_venue}</strong>.
            </InfoCard>
          </StaggerItem>
          <StaggerItem>
            <InfoCard icon={MonitorPlay} title="Meekijken" tint="text-brand-green">
              {config.stream_platform_url ? (
                <>
                  Volg de stream via{" "}
                  <a
                    href={config.stream_platform_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-primary underline-offset-4 hover:underline"
                  >
                    ons kanaal
                  </a>
                  . Abonneer alvast, dan mis je niets.
                </>
              ) : (
                "De link naar de livestream volgt binnenkort."
              )}
            </InfoCard>
          </StaggerItem>
        </StaggerGroup>
      </section>

      {/* FAQ */}
      <section id="vragen" className="scroll-mt-24 container mx-auto px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <SectionHeading eyebrow="Vragen" title="Veelgestelde vragen" />
          </Reveal>
          <Reveal delay={0.05}>
            <Accordion type="single" collapsible className="space-y-3">
              {faq.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={`faq-${item.id}`}
                  className="rounded-2xl border border-border bg-card px-5 last:border-b"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-bold hover:no-underline py-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
          {config.contact_email && (
            <p className="mt-6 text-center text-muted-foreground">
              Staat je vraag er niet tussen? Mail ons via{" "}
              <a href={`mailto:${config.contact_email}`} className="font-bold text-primary hover:underline">
                {config.contact_email}
              </a>
              .
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pt-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-pink to-[#c4166a] px-6 py-14 md:px-16 md:py-20 text-center text-white max-w-6xl mx-auto">
            <StarShape className="absolute top-6 left-8 size-10 text-brand-yellow/90 animate-twinkle" />
            <StarShape className="absolute bottom-8 right-10 size-14 text-white/20" />
            <StarShape className="absolute top-10 right-24 size-5 text-white/40 animate-twinkle" style={{ animationDelay: "1s" }} />
            <h2 className="text-3xl md:text-5xl font-bold text-balance">Samen maken we wensen waar</h2>
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Doe mee, help mee of doneer. Iedere bijdrage brengt een wensdag voor een kind in Drenthe een stap
              dichterbij.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="xl" className="bg-white text-[#a3124f] hover:bg-white/90">
                <a href={donate} target="_blank" rel="noopener noreferrer">
                  <Heart className="fill-current" />
                  Doneer aan {org}
                </a>
              </Button>
              {regFeature && regOpen ? (
                <Button asChild size="xl" variant="ghost" className="text-white border-2 border-white/60 hover:bg-white/10 hover:text-white">
                  <Link href="/register">
                    Meld je aan voor de stream
                    <ArrowRight />
                  </Link>
                </Button>
              ) : teamEnabled ? (
                <Button asChild size="xl" variant="ghost" className="text-white border-2 border-white/60 hover:bg-white/10 hover:text-white">
                  <Link href="/team">
                    Word vrijwilliger
                    <ArrowRight />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  )
}

function InfoCard({
  icon: Icon,
  title,
  tint,
  children,
}: {
  icon: typeof Calendar
  title: string
  tint: string
  children: ReactNode
}) {
  return (
    <div className="h-full rounded-3xl bg-card border border-border p-6 glow-card">
      <Icon className={`size-7 ${tint}`} />
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-muted-foreground leading-relaxed">{children}</p>
    </div>
  )
}
