"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Sponsor {
  id: number
  name: string
  tier: "Platinum" | "Gold" | "Silver" | "Bronze"
  logo_url: string | null
  description: string | null
  website: string | null
  contribution: string | null
  display_order: number
  is_active: boolean
}

export function SponsorsManager() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<{
    name: string
    tier: Sponsor["tier"]
    logo_url: string
    description: string
    website: string
    contribution: string
    display_order: number
    is_active: boolean
  }>({
    name: "",
    tier: "Silver",
    logo_url: "",
    description: "",
    website: "",
    contribution: "",
    display_order: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchSponsors()
  }, [])

  const fetchSponsors = async () => {
    try {
      const response = await fetch("/api/sponsors")
      if (response.ok) {
        const data = await response.json()
        setSponsors(data.sponsors)
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Sponsors laden mislukt",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingSponsor ? `/api/sponsors/${editingSponsor.id}` : "/api/sponsors"
      const method = editingSponsor ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Gelukt",
          description: `Sponsor ${editingSponsor ? "bijgewerkt" : "toegevoegd"}`,
        })
        fetchSponsors()
        resetForm()
        setIsDialogOpen(false)
      } else {
        throw new Error("Sponsor opslaan mislukt")
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Sponsor opslaan mislukt",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor)
    setFormData({
      name: sponsor.name,
      tier: sponsor.tier,
      logo_url: sponsor.logo_url || "",
      description: sponsor.description || "",
      website: sponsor.website || "",
      contribution: sponsor.contribution || "",
      display_order: sponsor.display_order,
      is_active: sponsor.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Weet je zeker dat je deze sponsor wilt verwijderen?")) return

    try {
      const response = await fetch(`/api/sponsors/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Gelukt",
          description: "Sponsor verwijderd",
        })
        fetchSponsors()
      } else {
        throw new Error("Sponsor verwijderen mislukt")
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Sponsor verwijderen mislukt",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      tier: "Silver",
      logo_url: "",
      description: "",
      website: "",
      contribution: "",
      display_order: 0,
      is_active: true,
    })
    setEditingSponsor(null)
  }

  const tierColors = {
    Platinum: "bg-slate-100 text-slate-800",
    Gold: "bg-yellow-100 text-yellow-800",
    Silver: "bg-gray-100 text-gray-800",
    Bronze: "bg-amber-100 text-amber-800",
  }

  if (loading) {
    return <div>Sponsors laden...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sponsors</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Sponsor toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSponsor ? "Sponsor bewerken" : "Nieuwe sponsor toevoegen"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Naam *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tier">Niveau *</Label>
                    <Select
                      value={formData.tier}
                      onValueChange={(value: any) => setFormData({ ...formData, tier: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Platinum">Platina</SelectItem>
                        <SelectItem value="Gold">Goud</SelectItem>
                        <SelectItem value="Silver">Zilver</SelectItem>
                        <SelectItem value="Bronze">Brons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="logo_url">Logo-URL</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="/path/to/logo.png"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Omschrijving</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_order">Volgorde</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) =>
                        setFormData({ ...formData, display_order: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contribution">Bijdrage</Label>
                  <Input
                    id="contribution"
                    value={formData.contribution}
                    onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                    placeholder="Wat ze bijdragen"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Actief</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuleren
                  </Button>
                  <Button type="submit">{editingSponsor ? "Bijwerken" : "Toevoegen"} Sponsor</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>Niveau</TableHead>
              <TableHead>Bijdrage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sponsors.map((sponsor) => (
              <TableRow key={sponsor.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {sponsor.logo_url && (
                      <img
                        src={sponsor.logo_url || "/placeholder.svg"}
                        alt={sponsor.name}
                        className="h-8 w-8 object-contain"
                      />
                    )}
                    <span className="font-medium">{sponsor.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={tierColors[sponsor.tier]}>{sponsor.tier}</Badge>
                </TableCell>
                <TableCell>{sponsor.contribution || "-"}</TableCell>
                <TableCell>
                  <Badge variant={sponsor.is_active ? "default" : "secondary"}>
                    {sponsor.is_active ? "Actief" : "Inactief"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {sponsor.website && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(sponsor)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(sponsor.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
