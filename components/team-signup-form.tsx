"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, CheckCircle2, Loader2, HandHeart, Users, Send } from "lucide-react"
import { cn } from "@/lib/utils"

type SignupType = "vrijwilliger" | "organisatie"

const typeOptions: { value: SignupType; label: string; text: string; icon: typeof Users }[] = [
  { value: "vrijwilliger", label: "Vrijwilliger", text: "Ik help tijdens de livestream", icon: HandHeart },
  { value: "organisatie", label: "Organisatie", text: "Ik denk mee in de voorbereiding", icon: Users },
]

export function TeamSignupForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    type: "vrijwilliger" as SignupType,
    name: "",
    email: "",
    discordNaam: "",
  })

  const update = (patch: Partial<typeof formData>) => setFormData((prev) => ({ ...prev, ...patch }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name.trim()) return setError("Vul je naam in.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) return setError("Vul een geldig e-mailadres in.")
    if (!formData.discordNaam.trim()) return setError("Vul je Discord-naam in.")

    setLoading(true)
    try {
      const response = await fetch("/api/team-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          name: formData.name.trim(),
          email: formData.email.trim(),
          discordNaam: formData.discordNaam.trim(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        setSubmitted(true)
      } else {
        setError(data.error || "Er ging iets mis. Probeer het opnieuw.")
      }
    } catch {
      setError("Geen verbinding. Controleer je internet en probeer het opnieuw.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-3xl bg-card border border-border p-8 md:p-10 text-center space-y-4 animate-fade-in">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-8" />
        </span>
        <h2 className="text-2xl md:text-3xl font-bold">Bedankt voor je aanmelding!</h2>
        <p className="text-muted-foreground text-lg">
          We hebben je aanmelding ontvangen en nemen zo snel mogelijk contact met je op.
        </p>
        <Button asChild size="xl" variant="outline">
          <Link href="/">Terug naar home</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-3xl bg-card border border-border p-6 md:p-8 shadow-sm space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Meld je aan</h2>
        <p className="text-muted-foreground">Het kost je maar een minuutje.</p>
      </div>

      <div className="space-y-3">
        <Label className="font-bold">Ik meld me aan als</Label>
        <RadioGroup
          value={formData.type}
          onValueChange={(value: SignupType) => update({ type: value })}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {typeOptions.map((opt) => (
            <Label
              key={opt.value}
              htmlFor={`type-${opt.value}`}
              className={cn(
                "flex items-start gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-colors",
                formData.type === opt.value ? "border-primary bg-accent/60" : "border-border hover:bg-muted",
              )}
            >
              <RadioGroupItem value={opt.value} id={`type-${opt.value}`} className="mt-1" />
              <span className="space-y-0.5">
                <span className="flex items-center gap-1.5 font-bold">
                  <opt.icon className="size-4 text-primary" />
                  {opt.label}
                </span>
                <span className="block text-sm font-normal text-muted-foreground">{opt.text}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="team-name" className="font-bold">
          Je naam
        </Label>
        <Input
          id="team-name"
          autoComplete="name"
          value={formData.name}
          onChange={(e) => update({ name: e.target.value })}
          className="h-12 rounded-xl text-base"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="team-email" className="font-bold">
          E-mailadres
        </Label>
        <Input
          id="team-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => update({ email: e.target.value })}
          className="h-12 rounded-xl text-base"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="team-discord" className="font-bold">
          Discord-naam
        </Label>
        <Input
          id="team-discord"
          value={formData.discordNaam}
          onChange={(e) => update({ discordNaam: e.target.value })}
          placeholder="bijv. sanne_dv"
          className="h-12 rounded-xl text-base"
          required
        />
        <p className="text-sm text-muted-foreground">We gebruiken Discord om het team te organiseren.</p>
      </div>

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="xl" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Send />}
        {loading ? "Versturen..." : "Aanmelden"}
      </Button>
    </form>
  )
}
