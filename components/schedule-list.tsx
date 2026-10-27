"use client"

import { useEffect, useState } from "react"
import { Clock, Users, Mic, Coffee, Music, Gamepad2, Trophy } from "lucide-react"
import type { PublicScheduleEvent } from "@/lib/site-data"
import { cn } from "@/lib/utils"

const typeMeta: Record<PublicScheduleEvent["event_type"], { label: string; icon: typeof Clock; tint: string }> = {
  gaming: { label: "Gaming", icon: Gamepad2, tint: "bg-secondary text-secondary-foreground" },
  music: { label: "Muziek", icon: Music, tint: "bg-accent text-accent-foreground" },
  talk: { label: "Gesprek", icon: Mic, tint: "bg-brand-green/15 text-green-800 dark:text-brand-green" },
  break: { label: "Pauze", icon: Coffee, tint: "bg-muted text-muted-foreground" },
  special: { label: "Speciaal", icon: Trophy, tint: "bg-brand-yellow/25 text-amber-800 dark:text-brand-yellow" },
}

const timeFmt = new Intl.DateTimeFormat("nl-NL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" })
const dayFmt = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Amsterdam" })

export function ScheduleList({ events }: { events: PublicScheduleEvent[] }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  let lastDay = ""

  return (
    <ol className="space-y-3">
      {events.map((event) => {
        const start = new Date(event.start_time)
        const end = new Date(event.end_time)
        const live = now !== null && now >= start.getTime() && now <= end.getTime()
        const past = now !== null && now > end.getTime()
        const meta = typeMeta[event.event_type] ?? typeMeta.special
        const day = dayFmt.format(start)
        const showDay = day !== lastDay
        lastDay = day

        return (
          <li key={event.id}>
            {showDay && <h2 className="mt-6 mb-3 text-lg font-bold capitalize text-muted-foreground">{day}</h2>}
            <div
              className={cn(
                "flex gap-4 rounded-2xl bg-card border p-4 md:p-5 transition",
                live ? "border-primary ring-2 ring-primary/30 shadow-lg" : "border-border",
                past && "opacity-55",
              )}
            >
              <div className="w-16 shrink-0 text-center">
                <div className="font-display text-lg font-bold tabular-nums">{timeFmt.format(start)}</div>
                <div className="text-xs text-muted-foreground tabular-nums">tot {timeFmt.format(end)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold", meta.tint)}>
                    <meta.icon className="size-3.5" />
                    {meta.label}
                  </span>
                  {live && (
                    <span className="rounded-full bg-red-600 text-white px-2.5 py-0.5 text-xs font-bold">NU LIVE</span>
                  )}
                </div>
                <h3 className="mt-1.5 text-lg font-bold">{event.title}</h3>
                {event.description && <p className="text-muted-foreground">{event.description}</p>}
                {event.participants.length > 0 && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="size-4 shrink-0" />
                    {event.participants.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
