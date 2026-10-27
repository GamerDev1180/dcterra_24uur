"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Mail, ArrowLeft, Send, PartyPopper, MessageCircle } from "lucide-react"
import { useSiteConfig } from "@/components/site-config-provider"
import type { RegistrationData } from "../registration-flow"

interface ConfirmationStepProps {
  data: RegistrationData
  onPrev: () => void
}

export function ConfirmationStep({ data, onPrev }: ConfirmationStepProps) {
  const config = useSiteConfig()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [questionTextById, setQuestionTextById] = useState<Record<number, string>>({})

  useEffect(() => {
    fetch("/api/questions")
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (!result?.questions) return
        const lookup: Record<number, string> = {}
        for (const q of result.questions) lookup[q.id] = q.question_text
        setQuestionTextById(lookup)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(result.error || "Aanmelden is niet gelukt. Probeer het opnieuw.")
        return
      }
      setSubmitted(true)
    } catch {
      setError("Geen verbinding. Controleer je internet en probeer het opnieuw.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-6 py-4">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success animate-glow-pulse">
          <PartyPopper className="size-8" />
        </span>
        <div>
          <h3 className="text-3xl font-bold">Je bent aangemeld!</h3>
          <p className="mt-2 text-lg text-muted-foreground">
            Super dat je meedoet, {data.name.split(" ")[0]}! Samen laten we kinderen stralen.
          </p>
        </div>

        <div className="rounded-2xl bg-secondary text-secondary-foreground p-5 text-left">
          <p className="flex items-center gap-2 font-bold">
            <Mail className="size-5" /> Check je mail ({data.email})
          </p>
          <ul className="mt-3 space-y-1.5 text-sm list-disc pl-5">
            <li>Je persoonlijke Discord-toegangscode</li>
            <li>De link naar onze Discord-server</li>
            <li>De afspraken en praktische informatie</li>
          </ul>
          <p className="mt-3 text-sm opacity-80">Niets ontvangen binnen een paar minuten? Kijk even in je spammap.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {config.discord_invite_link && (
            <Button asChild size="xl">
              <a href="/discord">
                <MessageCircle />
                Naar de Discord
              </a>
            </Button>
          )}
          <Button asChild size="xl" variant="outline">
            <Link href="/">Terug naar home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const answered = Object.entries(data.answers).filter(([, answer]) => answer?.trim())

  return (
    <div className="space-y-6">
      <dl className="rounded-2xl bg-muted/70 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
          <dt className="font-bold">Naam</dt>
          <dd className="text-muted-foreground break-all">{data.name}</dd>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
          <dt className="font-bold">E-mail</dt>
          <dd className="text-muted-foreground break-all">{data.email}</dd>
        </div>
      </dl>

      {answered.length > 0 && (
        <div className="rounded-2xl border border-border p-5 space-y-4">
          <p className="font-bold">Jouw antwoorden</p>
          {answered.map(([questionId, answer]) => (
            <div key={questionId} className="text-sm">
              <p className="font-semibold text-muted-foreground">
                {questionTextById[Number(questionId)] || `Vraag ${questionId}`}
              </p>
              <p className="mt-0.5 whitespace-pre-line">{answer}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between">
        <Button variant="outline" size="xl" onClick={onPrev} disabled={submitting}>
          <ArrowLeft />
          Terug
        </Button>
        <Button size="xl" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" /> : <Send />}
          Aanmelding versturen
        </Button>
      </div>
    </div>
  )
}
