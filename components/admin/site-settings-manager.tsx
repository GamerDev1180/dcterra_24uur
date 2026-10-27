"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { RefreshCw, Flag, Building2, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type ConfigMap = Record<string, string>

const FEATURE_FLAGS: { key: string; label: string; help: string }[] = [
  { key: "feature_registration_enabled", label: "Aanmelden", help: "Toon de pagina en menulink om mee te doen aan de stream" },
  { key: "feature_schedule_enabled", label: "Programma", help: "Toon de programmapagina en menulink" },
  { key: "feature_sponsors_enabled", label: "Sponsors", help: "Toon de sponsorpagina en menulink" },
  { key: "feature_team_enabled", label: "Vrijwilligers aanmelden", help: "Toon de pagina en menulink om vrijwilliger te worden" },
  { key: "feature_faq_enabled", label: "FAQ", help: "Toon vragen uit de database op de homepagina (zonder vragen worden standaardvragen getoond)" },
]

const ORG_FIELDS: { key: string; label: string; placeholder?: string; multiline?: boolean }[] = [
  { key: "org_name", label: "Naam organisatie" },
  { key: "org_website_url", label: "Website organisatie", placeholder: "https://example.org" },
  { key: "org_description", label: "Korte omschrijving van het goede doel", multiline: true },
  { key: "event_venue", label: "Locatie" },
  { key: "discord_invite_link", label: "Discord-uitnodigingslink", placeholder: "https://discord.gg/..." },
  { key: "stream_platform_url", label: "Link naar livestream" },
  { key: "contact_email", label: "Openbaar contact-e-mailadres" },
]

export function SiteSettingsManager() {
  const [config, setConfig] = useState<ConfigMap | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/event-config")
      if (response.ok) {
        setConfig(await response.json())
      }
    } catch (error) {
      toast({ title: "Fout", description: "Site-instellingen laden mislukt", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (key: string, value: string) => {
    setSavingKey(key)
    try {
      const response = await fetch("/api/event-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config_key: key, config_value: value }),
      })

      if (response.ok) {
        setConfig((prev) => (prev ? { ...prev, [key]: value } : prev))
      } else {
        throw new Error("Instelling opslaan mislukt")
      }
    } catch (error) {
      toast({ title: "Fout", description: "Instelling opslaan mislukt", variant: "destructive" })
    } finally {
      setSavingKey(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-muted-foreground">Site-instellingen laden mislukt</p>
          <Button onClick={fetchConfig} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Opnieuw proberen
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Onderdelen aan/uit
          </CardTitle>
          <CardDescription>
            Zet pagina's en menu-items aan of uit, zonder code aan te passen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {FEATURE_FLAGS.map((flag) => (
            <div key={flag.key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">{flag.label}</p>
                <p className="text-sm text-muted-foreground">{flag.help}</p>
              </div>
              <Switch
                checked={config[flag.key] === "true"}
                onCheckedChange={(checked) => updateConfig(flag.key, checked.toString())}
                disabled={savingKey === flag.key}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organisatie en inhoud
          </CardTitle>
          <CardDescription>Wordt op de hele website getoond. Pas dit elk jaar hier aan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ORG_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.multiline ? (
                <Textarea
                  id={field.key}
                  defaultValue={config[field.key] || ""}
                  placeholder={field.placeholder}
                  onBlur={(e) => updateConfig(field.key, e.target.value)}
                  disabled={savingKey === field.key}
                  rows={3}
                />
              ) : (
                <Input
                  id={field.key}
                  defaultValue={config[field.key] || ""}
                  placeholder={field.placeholder}
                  onBlur={(e) => updateConfig(field.key, e.target.value)}
                  disabled={savingKey === field.key}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cijfers
          </CardTitle>
          <CardDescription>
            Er is geen betaalkoppeling: vul het opgehaalde bedrag hier zelf in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stat_funds_raised_amount">Opgehaald bedrag (weergave, bijv. "€2.450")</Label>
            <Input
              id="stat_funds_raised_amount"
              defaultValue={config.stat_funds_raised_amount || "0"}
              onBlur={(e) => updateConfig("stat_funds_raised_amount", e.target.value)}
              disabled={savingKey === "stat_funds_raised_amount"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stat_funds_goal_amount">Inzameldoel (weergave, bijv. "€10.000")</Label>
            <Input
              id="stat_funds_goal_amount"
              defaultValue={config.stat_funds_goal_amount || "0"}
              onBlur={(e) => updateConfig("stat_funds_goal_amount", e.target.value)}
              disabled={savingKey === "stat_funds_goal_amount"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stat_expected_participants">Verwachte deelnemers (weergave, bijv. "100+")</Label>
            <Input
              id="stat_expected_participants"
              defaultValue={config.stat_expected_participants || "0"}
              onBlur={(e) => updateConfig("stat_expected_participants", e.target.value)}
              disabled={savingKey === "stat_expected_participants"}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
