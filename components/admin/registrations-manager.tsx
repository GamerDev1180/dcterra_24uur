"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, Search, Eye, Trash2, CheckCircle, XCircle, Camera, CameraOff, Loader2 } from "lucide-react"

interface Registration {
  id: number
  name: string
  email: string
  on_camera: boolean
  discord_code: string
  status: "pending" | "confirmed" | "cancelled"
  registration_date: string
  answers?: { question_text: string; answer: string }[]
}

interface RegistrationsManagerProps {
  onStatsUpdate: () => void
}

export function RegistrationsManager({ onStatsUpdate }: RegistrationsManagerProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [cameraFilter, setCameraFilter] = useState<string>("all")
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const response = await fetch("/api/admin/registrations")

      if (response.ok) {
        const data = await response.json()
        setRegistrations(data.registrations)
      }
    } catch (error) {
      console.error("Failed to fetch registrations:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateRegistrationStatus = async (id: number, status: "confirmed" | "cancelled") => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/registrations/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchRegistrations()
        onStatsUpdate()
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteRegistration = async (id: number) => {
    if (!confirm("Weet je zeker dat je deze aanmelding wilt verwijderen?")) return

    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchRegistrations()
        onStatsUpdate()
      }
    } catch (error) {
      console.error("Failed to delete registration:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const exportToCSV = async () => {
    try {
      const response = await fetch("/api/admin/registrations/export")

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `registrations-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Failed to export CSV:", error)
    }
  }

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter
    const matchesCamera =
      cameraFilter === "all" ||
      (cameraFilter === "on_camera" && reg.on_camera) ||
      (cameraFilter === "off_camera" && !reg.on_camera)

    return matchesSearch && matchesStatus && matchesCamera
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Aanmeldingen laden...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Aanmeldingen deelnemers</CardTitle>
            <CardDescription>Bekijk en beheer alle aanmeldingen ({registrations.length} in totaal)</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exporteer CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Zoek op naam of e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle statussen</SelectItem>
              <SelectItem value="pending">In afwachting</SelectItem>
              <SelectItem value="confirmed">Bevestigd</SelectItem>
              <SelectItem value="cancelled">Geannuleerd</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cameraFilter} onValueChange={setCameraFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle types</SelectItem>
              <SelectItem value="on_camera">Voor de camera</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Registrations Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Discord-code</TableHead>
                <TableHead>Aangemeld op</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell className="font-medium">{registration.name}</TableCell>
                  <TableCell>{registration.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={registration.on_camera ? "default" : "secondary"}
                      className="flex items-center space-x-1 w-fit"
                    >
                      {registration.on_camera ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
                      <span>{registration.on_camera ? "Voor de camera" : "Achter de schermen"}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        registration.status === "confirmed"
                          ? "default"
                          : registration.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {registration.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{registration.discord_code}</code>
                  </TableCell>
                  <TableCell>{new Date(registration.registration_date).toLocaleDateString("nl-NL")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedRegistration(registration)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Details aanmelding</DialogTitle>
                            <DialogDescription>Alle gegevens van deze aanmelding</DialogDescription>
                          </DialogHeader>
                          {selectedRegistration && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Naam</label>
                                  <p>{selectedRegistration.name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">E-mail</label>
                                  <p>{selectedRegistration.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Type</label>
                                  <p>{selectedRegistration.on_camera ? "Voor de camera" : "Achter de schermen"}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Discord-code</label>
                                  <p>
                                    <code>{selectedRegistration.discord_code}</code>
                                  </p>
                                </div>
                              </div>
                              {selectedRegistration.answers && selectedRegistration.answers.length > 0 && (
                                <div>
                                  <label className="text-sm font-medium">Antwoorden</label>
                                  <div className="space-y-2 mt-2">
                                    {selectedRegistration.answers.map((answer, index) => (
                                      <div key={index} className="border rounded p-3">
                                        <p className="text-sm font-medium text-muted-foreground">
                                          {answer.question_text}
                                        </p>
                                        <p className="mt-1">{answer.answer}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {registration.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateRegistrationStatus(registration.id, "confirmed")}
                            disabled={actionLoading === registration.id}
                          >
                            {actionLoading === registration.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateRegistrationStatus(registration.id, "cancelled")}
                            disabled={actionLoading === registration.id}
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRegistration(registration.id)}
                        disabled={actionLoading === registration.id}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Geen aanmeldingen gevonden met deze filters.</div>
        )}
      </CardContent>
    </Card>
  )
}
