"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FaqItem {
  id: number
  question: string
  answer: string
  display_order: number
  is_active: boolean
}

const emptyForm = { question: "", answer: "", display_order: 0, is_active: true }

export function FaqManager() {
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/admin/faq")
      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
      }
    } catch (error) {
      toast({ title: "Fout", description: "Vragen laden mislukt", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingItem(null)
  }

  const handleEdit = (item: FaqItem) => {
    setEditingItem(item)
    setFormData({
      question: item.question,
      answer: item.answer,
      display_order: item.display_order,
      is_active: item.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingItem ? `/api/admin/faq/${editingItem.id}` : "/api/admin/faq"
      const method = editingItem ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({ title: "Gelukt", description: `Vraag ${editingItem ? "bijgewerkt" : "toegevoegd"}` })
        fetchItems()
        resetForm()
        setIsDialogOpen(false)
      } else {
        const result = await response.json()
        throw new Error(result.error || "Vraag opslaan mislukt")
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Vraag opslaan mislukt",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Weet je zeker dat je deze vraag wilt verwijderen?")) return

    try {
      const response = await fetch(`/api/admin/faq/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Gelukt", description: "Vraag verwijderd" })
        fetchItems()
      } else {
        throw new Error("Vraag verwijderen mislukt")
      }
    } catch (error) {
      toast({ title: "Fout", description: "Vraag verwijderen mislukt", variant: "destructive" })
    }
  }

  if (loading) {
    return <div>Vragen laden...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Veelgestelde vragen</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Vraag toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Vraag bewerken" : "Vraag toevoegen"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="question">Vraag *</Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="answer">Antwoord *</Label>
                  <Textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 items-end">
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
                  <div className="flex items-center space-x-2 pb-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Actief</Label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuleren
                  </Button>
                  <Button type="submit">{editingItem ? "Bijwerken" : "Toevoegen"} FAQ</Button>
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
              <TableHead>Vraag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-md truncate font-medium">{item.question}</TableCell>
                <TableCell>
                  <Badge variant={item.is_active ? "default" : "secondary"}>
                    {item.is_active ? "Actief" : "Inactief"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Nog geen vragen.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
