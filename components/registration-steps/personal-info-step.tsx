"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowRight } from "lucide-react"
import type { RegistrationData } from "../registration-flow"

const ALLOWED_DOMAINS = ["@dcterra.nl", "@student.dcterra.nl"]

function isAllowedEmailDomain(email: string): boolean {
  const lower = email.toLowerCase()
  return ALLOWED_DOMAINS.some((domain) => lower.endsWith(domain))
}

interface PersonalInfoStepProps {
  data: RegistrationData
  onUpdate: (data: Partial<RegistrationData>) => void
  onNext: () => void
}

export function PersonalInfoStep({ data, onUpdate, onNext }: PersonalInfoStepProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const name = data.name.trim()
    const email = data.email.trim().toLowerCase()

    if (!name) return setError("Vul je naam in.")
    if (!email) return setError("Vul je e-mailadres in.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !isAllowedEmailDomain(email)) {
      return setError("Gebruik je DCTerra-mailadres (eindigt op @dcterra.nl of @student.dcterra.nl).")
    }

    onUpdate({ name, email })
    setLoading(true)
    try {
      const response = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(result.error || "Er ging iets mis. Probeer het opnieuw.")
        return
      }
      if (result.exists) {
        setError("Met dit e-mailadres is al iemand aangemeld. Check je inbox voor de bevestigingsmail.")
        return
      }
      onNext()
    } catch {
      setError("Geen verbinding. Controleer je internet en probeer het opnieuw.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="font-bold">
            Je naam
          </Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            value={data.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Bijvoorbeeld: Sanne de Vries"
            className="h-12 rounded-xl text-base"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="font-bold">
            Je DCTerra-mailadres
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={data.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder="123456@student.dcterra.nl"
            className="h-12 rounded-xl text-base"
            required
          />
          <p className="text-sm text-muted-foreground">
            Alleen adressen die eindigen op @dcterra.nl of @student.dcterra.nl. Hierop ontvang je je bevestiging.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="xl" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          Volgende stap
          {!loading && <ArrowRight />}
        </Button>
      </div>
    </form>
  )
}
