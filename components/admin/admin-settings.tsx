"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Settings, Loader2, AlertCircle, RotateCcw } from "lucide-react"

export function AdminSettings() {
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin" as "admin" | "super_admin",
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resetting, setResetting] = useState(false)
  const [resetMessage, setResetMessage] = useState("")

  const createAdmin = async () => {
    if (!newAdmin.username || !newAdmin.email || !newAdmin.password) {
      setError("Alle velden zijn verplicht")
      return
    }

    setCreating(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAdmin),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess("Beheerder aangemaakt")
        setNewAdmin({
          username: "",
          email: "",
          password: "",
          role: "admin",
        })
      } else {
        setError(result.error || "Beheerder aanmaken mislukt")
      }
    } catch (error) {
      setError("Netwerkfout. Probeer het opnieuw.")
    } finally {
      setCreating(false)
    }
  }

  const handleResetForNextYear = async () => {
    const confirmed = confirm(
      "Hiermee worden ALLE huidige aanmeldingen en team-aanmeldingen gearchiveerd en daarna leeggemaakt, zodat je volgend jaar opnieuw kunt beginnen. Sponsors, vragen en site-instellingen blijven bewaard. Dit kun je hier niet ongedaan maken. Doorgaan?",
    )
    if (!confirmed) return

    setResetting(true)
    setResetMessage("")
    try {
      const response = await fetch("/api/admin/reset-event", { method: "POST" })
      const result = await response.json()

      if (response.ok) {
        setResetMessage(`Done. Registrations and team signups archived under year ${result.archivedYear}.`)
      } else {
        setResetMessage(result.error || "Resetten mislukt.")
      }
    } catch (error) {
      setResetMessage("Netwerkfout. Probeer het opnieuw.")
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Create Admin User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Beheerder aanmaken</span>
          </CardTitle>
          <CardDescription>Voeg nieuwe beheerders toe die het evenement mogen beheren</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Gebruikersnaam</Label>
              <Input
                id="username"
                value={newAdmin.username}
                onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                placeholder="Gebruikersnaam"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                placeholder="admin@dcterra.nl"
              />
            </div>
            <div>
              <Label htmlFor="password">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                placeholder="Kies een sterk wachtwoord"
              />
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select
                value={newAdmin.role}
                onValueChange={(value: "admin" | "super_admin") => setNewAdmin({ ...newAdmin, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Beheerder</SelectItem>
                  <SelectItem value="super_admin">Hoofdbeheerder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={createAdmin} disabled={creating}>
            {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Beheerder aanmaken
          </Button>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Systeeminformatie</span>
          </CardTitle>
          <CardDescription>Huidige systeeminstellingen en status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Naam evenement</Label>
                <p className="text-sm text-muted-foreground">24 uur live voor Wensstichting Drenthe</p>
              </div>
              <div>
                <Label>Versie</Label>
                <p className="text-sm text-muted-foreground">v1.0.0</p>
              </div>
              <div>
                <Label>Databasestatus</Label>
                <p className="text-sm text-green-600">Verbonden</p>
              </div>
              <div>
                <Label>E-maildienst</Label>
                <p className="text-sm text-green-600">Ingesteld</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset for Next Year */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RotateCcw className="w-5 h-5" />
            <span>Archiveren en resetten voor volgend jaar</span>
          </CardTitle>
          <CardDescription>
            Archiveert alle aanmeldingen en team-aanmeldingen en maakt ze daarna leeg, zodat de site klaar is voor
            het volgende evenement. Sponsors, vragen, programma en site-instellingen blijven staan. Alleen voor hoofdbeheerders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resetMessage && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{resetMessage}</AlertDescription>
            </Alert>
          )}
          <Button variant="destructive" onClick={handleResetForNextYear} disabled={resetting}>
            {resetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
            Aanmeldingen archiveren en resetten
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
