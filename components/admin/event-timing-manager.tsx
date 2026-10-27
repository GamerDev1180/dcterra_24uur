"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Clock, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EventConfig {
  stream_start_time: string
  registration_end_time: string
  registration_open: string
  event_title: string
  event_description: string
}

export function EventTimingManager() {
  const [config, setConfig] = useState<EventConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/event-config")
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error("Error fetching config:", error)
      toast({
        title: "Fout",
        description: "Instellingen laden mislukt",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (key: string, value: string) => {
    setSaving(true)
    try {
      const response = await fetch("/api/event-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config_key: key,
          config_value: value,
        }),
      })

      if (response.ok) {
        setConfig((prev) => (prev ? { ...prev, [key]: value } : null))
        toast({
          title: "Gelukt",
          description: "Instellingen opgeslagen",
        })
      } else {
        throw new Error("Instellingen opslaan mislukt")
      }
    } catch (error) {
      console.error("Error updating config:", error)
      toast({
        title: "Fout",
        description: "Instellingen opslaan mislukt",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  const handleDateTimeChange = (key: string, value: string) => {
    const isoString = new Date(value).toISOString().slice(0, 19).replace("T", " ")
    updateConfig(key, isoString)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tijden
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tijden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Instellingen laden mislukt</p>
          <Button onClick={fetchConfig} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Opnieuw proberen
          </Button>
        </CardContent>
      </Card>
    )
  }

  const now = new Date()
  const streamStart = new Date(config.stream_start_time)
  const regEnd = new Date(config.registration_end_time)
  const isStreamLive = now >= streamStart
  const isRegClosed = now >= regEnd || config.registration_open !== "true"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tijden en aanmelding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Registration Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-medium">Status aanmelding</h3>
              <p className="text-sm text-muted-foreground">
                {isRegClosed ? "Registration is currently closed" : "Aanmelden is open"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={isRegClosed ? "destructive" : "default"}>{isRegClosed ? "Gesloten" : "Open"}</Badge>
              <Switch
                checked={config.registration_open === "true"}
                onCheckedChange={(checked) => updateConfig("registration_open", checked.toString())}
                disabled={saving}
              />
            </div>
          </div>

          {/* Stream Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-medium">Status stream</h3>
              <p className="text-sm text-muted-foreground">
                {isStreamLive ? "Stream is currently live" : "De stream is nog niet begonnen"}
              </p>
            </div>
            <Badge variant={isStreamLive ? "default" : "secondary"}>{isStreamLive ? "🔴 LIVE" : "Gepland"}</Badge>
          </div>

          {/* Timing Configuration */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stream-start">Starttijd stream</Label>
              <Input
                id="stream-start"
                type="datetime-local"
                value={formatDateTimeLocal(config.stream_start_time)}
                onChange={(e) => handleDateTimeChange("stream_start_time", e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-end">Aanmelden sluit op</Label>
              <Input
                id="reg-end"
                type="datetime-local"
                value={formatDateTimeLocal(config.registration_end_time)}
                onChange={(e) => handleDateTimeChange("registration_end_time", e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Titel evenement</Label>
              <Input
                id="event-title"
                value={config.event_title}
                onChange={(e) => setConfig((prev) => (prev ? { ...prev, event_title: e.target.value } : null))}
                onBlur={(e) => updateConfig("event_title", e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Omschrijving evenement</Label>
              <Input
                id="event-description"
                value={config.event_description}
                onChange={(e) => setConfig((prev) => (prev ? { ...prev, event_description: e.target.value } : null))}
                onBlur={(e) => updateConfig("event_description", e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
