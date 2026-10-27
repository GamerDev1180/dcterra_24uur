"use client"

import { useEffect, useState } from "react"
import { Radio, PartyPopper, CalendarClock } from "lucide-react"
import { formatEventDate, parseEventDate } from "@/lib/site-defaults"
import { cn } from "@/lib/utils"

interface EventTimerProps {
  streamStartTime: string
  registrationEndTime?: string
  registrationOpen?: boolean
  streamUrl?: string
  className?: string
}

const STREAM_DURATION_MS = 24 * 60 * 60 * 1000

function splitDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    dagen: Math.floor(total / 86400),
    uren: Math.floor((total % 86400) / 3600),
    minuten: Math.floor((total % 3600) / 60),
    seconden: total % 60,
  }
}

export function EventTimer({ streamStartTime, registrationEndTime, registrationOpen, streamUrl, className }: EventTimerProps) {
  const start = parseEventDate(streamStartTime)
  const regEnd = parseEventDate(registrationEndTime)
  // `null` until mounted so server and client render the same markup.
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!start) return null

  const startMs = start.getTime()
  const endMs = startMs + STREAM_DURATION_MS
  const phase = now === null || now < startMs ? "voor" : now < endMs ? "live" : "klaar"

  if (phase === "live") {
    const left = splitDuration(endMs - (now ?? 0))
    return (
      <div className={cn("rounded-3xl bg-card border border-border p-6 md:p-8 shadow-xl shadow-primary/10", className)}>
        <div className="flex flex-col items-center text-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-600 text-white px-4 py-1.5 text-sm font-bold animate-glow-pulse">
            <Radio className="size-4" /> NU LIVE
          </span>
          <p className="text-lg font-semibold">
            We zijn live! Nog {left.uren} uur en {left.minuten} minuten te gaan.
          </p>
          {streamUrl && (
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 font-bold hover:brightness-110"
            >
              Kijk nu mee
            </a>
          )}
        </div>
      </div>
    )
  }

  if (phase === "klaar") {
    return (
      <div className={cn("rounded-3xl bg-card border border-border p-6 md:p-8 text-center", className)}>
        <PartyPopper className="size-8 text-primary mx-auto mb-3" />
        <p className="text-lg font-semibold">De livestream zit erop. Bedankt aan iedereen die heeft meegedaan!</p>
      </div>
    )
  }

  const left = now === null ? null : splitDuration(startMs - now)
  const units: [keyof ReturnType<typeof splitDuration>, string][] = [
    ["dagen", "dagen"],
    ["uren", "uur"],
    ["minuten", "min"],
    ["seconden", "sec"],
  ]
  const regLabel = registrationOpen && regEnd && now !== null && now < regEnd.getTime() ? formatEventDate(registrationEndTime) : null

  return (
    <div className={cn("rounded-3xl bg-card/90 backdrop-blur border border-border p-5 md:p-7 shadow-xl shadow-brand-navy/5", className)}>
      <p className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        <CalendarClock className="size-4 text-brand-blue" />
        De livestream begint over
      </p>
      <div className="grid grid-cols-4 gap-2 md:gap-3" role="timer" aria-live="off">
        {units.map(([key, label], i) => (
          <div
            key={key}
            className={cn(
              "rounded-2xl py-3 md:py-4 text-center",
              ["bg-accent", "bg-secondary", "bg-brand-yellow/20", "bg-brand-green/15"][i],
            )}
          >
            <div className="font-display text-3xl md:text-5xl font-bold tabular-nums text-foreground">
              {left ? String(left[key]).padStart(2, "0") : "--"}
            </div>
            <div className="text-xs md:text-sm font-semibold text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Start: <span className="font-semibold text-foreground" suppressHydrationWarning>{formatEventDate(streamStartTime)}</span>
        {regLabel && (
          <>
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> · </span>
            Aanmelden kan tot <span className="font-semibold text-foreground">{regLabel}</span>
          </>
        )}
      </p>
    </div>
  )
}
