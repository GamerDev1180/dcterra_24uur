"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, Mail, Loader2, AlertCircle } from "lucide-react"

interface EmailDomain {
  id: number
  domain: string
  created_at: string
}

export function EmailDomainsManager() {
  const [domains, setDomains] = useState<EmailDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [newDomain, setNewDomain] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchDomains()
  }, [])

  const fetchDomains = async () => {
    try {
      const response = await fetch("/api/admin/email-domains")

      if (response.ok) {
        const data = await response.json()
        setDomains(data.domains)
      }
    } catch (error) {
      console.error("Failed to fetch domains:", error)
    } finally {
      setLoading(false)
    }
  }

  const addDomain = async () => {
    if (!newDomain.trim()) {
      setError("Vul een domein in")
      return
    }

    if (!newDomain.startsWith("@")) {
      setError("Domein moet beginnen met @")
      return
    }

    setAdding(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/email-domains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: newDomain.trim() }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess("Domein toegevoegd")
        setNewDomain("")
        await fetchDomains()
      } else {
        setError(result.error || "Domein toevoegen mislukt")
      }
    } catch (error) {
      setError("Netwerkfout. Probeer het opnieuw.")
    } finally {
      setAdding(false)
    }
  }

  const deleteDomain = async (id: number) => {
    if (!confirm("Weet je zeker dat je dit domein wilt verwijderen?")) return

    try {
      const response = await fetch(`/api/admin/email-domains/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Domein verwijderd")
        await fetchDomains()
      } else {
        setError("Domein verwijderen mislukt")
      }
    } catch (error) {
      setError("Netwerkfout. Probeer het opnieuw.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="w-5 h-5" />
          <span>Toegestane e-maildomeinen</span>
        </CardTitle>
        <CardDescription>Bepaal met welke e-maildomeinen mensen zich mogen aanmelden</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Domain */}
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="domain">Nieuw domein toevoegen</Label>
              <Input
                id="domain"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="@example.com"
                onKeyPress={(e) => e.key === "Enter" && addDomain()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addDomain} disabled={adding}>
                {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Domein toevoegen
              </Button>
            </div>
          </div>

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
        </div>

        {/* Domains Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domein</TableHead>
                <TableHead>Toegevoegd op</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{domain.domain}</code>
                  </TableCell>
                  <TableCell>{new Date(domain.created_at).toLocaleDateString("nl-NL")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => deleteDomain(domain.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {domains.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">Nog geen e-maildomeinen ingesteld.</div>
        )}
      </CardContent>
    </Card>
  )
}
