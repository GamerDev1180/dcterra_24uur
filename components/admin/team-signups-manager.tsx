"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Search, Eye, Trash2, CheckCircle, XCircle, Loader2, HeartHandshake, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TeamSignup {
  id: number
  type: "vrijwilliger" | "organisatie"
  name: string
  organization_name: string | null
  email: string
  phone: string | null
  message: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
  discord_naam: string
}

export function TeamSignupsManager() {
  const { toast } = useToast()
  const [signups, setSignups] = useState<TeamSignup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedSignup, setSelectedSignup] = useState<TeamSignup | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    fetchSignups()
  }, [])

  const fetchSignups = async () => {
    try {
      const response = await fetch("/api/admin/team-signups")

      if (response.ok) {
        const data = await response.json()
        setSignups(data.signups)
      }
    } catch (error) {
      console.error("Failed to fetch team signups:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, status: "approved" | "rejected") => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/team-signups/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchSignups()
      } else {
        throw new Error("Status bijwerken mislukt")
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Status bijwerken is mislukt",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const deleteSignup = async (id: number) => {
    if (!confirm("Weet je zeker dat je deze aanmelding wilt verwijderen?")) return

    setActionLoading(id)
    try {
      const response = await fetch(`/api/admin/team-signups/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchSignups()
      } else {
        throw new Error("Verwijderen mislukt")
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Verwijderen is mislukt",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const filteredSignups = signups.filter((signup) => {
    const matchesSearch =
      signup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signup.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (signup.organization_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      signup.discord_naam.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || signup.status === statusFilter
    const matchesType = typeFilter === "all" || signup.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
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
        <div>
          <CardTitle>Team-aanmeldingen</CardTitle>
          <CardDescription>
            Vrijwilligers en organisaties die zich hebben aangemeld ({signups.length} totaal)
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Zoek op naam, e-mail of organisatie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle types</SelectItem>
              <SelectItem value="vrijwilliger">Vrijwilliger</SelectItem>
              <SelectItem value="organisatie">Organisatie</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle statussen</SelectItem>
              <SelectItem value="pending">In behandeling</SelectItem>
              <SelectItem value="approved">Goedgekeurd</SelectItem>
              <SelectItem value="rejected">Afgewezen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Signups Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Discord-naam</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aangemeld op</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSignups.map((signup) => (
                <TableRow key={signup.id}>
                  <TableCell className="font-medium">
                    {signup.name}
                    {signup.organization_name && (
                      <div className="text-xs text-muted-foreground">{signup.organization_name}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={signup.type === "organisatie" ? "default" : "secondary"}
                      className="flex items-center space-x-1 w-fit"
                    >
                      {signup.type === "organisatie" ? (
                        <Building2 className="w-3 h-3" />
                      ) : (
                        <HeartHandshake className="w-3 h-3" />
                      )}
                      <span>{signup.type === "organisatie" ? "Organisatie" : "Vrijwilliger"}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{signup.email}</TableCell>
                  <TableCell>{signup.discord_naam}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        signup.status === "approved"
                          ? "default"
                          : signup.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {signup.status === "approved"
                        ? "Goedgekeurd"
                        : signup.status === "pending"
                          ? "In behandeling"
                          : "Afgewezen"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(signup.created_at).toLocaleDateString("nl-NL")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedSignup(signup)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Aanmelding Details</DialogTitle>
                            <DialogDescription>Volledige informatie van de aanmelding</DialogDescription>
                          </DialogHeader>
                          {selectedSignup && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Naam</label>
                                  <p>{selectedSignup.name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Type</label>
                                  <p>{selectedSignup.type === "organisatie" ? "Organisatie" : "Vrijwilliger"}</p>
                                </div>
                                {selectedSignup.organization_name && (
                                  <div>
                                    <label className="text-sm font-medium">Organisatie</label>
                                    <p>{selectedSignup.organization_name}</p>
                                  </div>
                                )}
                                <div>
                                  <label className="text-sm font-medium">E-mail</label>
                                  <p>{selectedSignup.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Telefoon</label>
                                  <p>{selectedSignup.phone || "-"}</p>
                                </div>
                              </div>
                              {selectedSignup.message && (
                                <div>
                                  <label className="text-sm font-medium">Bericht</label>
                                  <p className="mt-1 border rounded p-3 text-sm">{selectedSignup.message}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {signup.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(signup.id, "approved")}
                            disabled={actionLoading === signup.id}
                          >
                            {actionLoading === signup.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(signup.id, "rejected")}
                            disabled={actionLoading === signup.id}
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSignup(signup.id)}
                        disabled={actionLoading === signup.id}
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

        {filteredSignups.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Geen aanmeldingen gevonden.</div>
        )}
      </CardContent>
    </Card>
  )
}
