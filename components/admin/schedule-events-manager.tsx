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
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScheduleEvent {
  id: number
  title: string
  description: string | null
  start_time: string
  end_time: string
  event_type: "gaming" | "music" | "talk" | "break" | "special"
  participants: string[] | null
  display_order: number
  is_active: boolean
}

const emptyForm = {
  title: "",
  description: "",
  start_time: "",
  end_time: "",
  event_type: "special" as ScheduleEvent["event_type"],
  participants: "",
  display_order: 0,
  is_active: true,
}

// MySQL DATETIME <-> <input type="datetime-local"> conversions (no timezone
// shifting -- both are treated as naive local timestamps).
function toDateTimeLocal(value: string) {
  if (!value) return ""
  return value.replace(" ", "T").slice(0, 16)
}

function toMysqlDateTime(value: string) {
  return value.replace("T", " ") + ":00"
}

export function ScheduleEventsManager() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/schedule-events")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      }
    } catch (error) {
      toast({ title: "Fout", description: "Programma laden mislukt", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingEvent(null)
  }

  const handleEdit = (event: ScheduleEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || "",
      start_time: toDateTimeLocal(event.start_time),
      end_time: toDateTimeLocal(event.end_time),
      event_type: event.event_type,
      participants: (event.participants || []).join(", "),
      display_order: event.display_order,
      is_active: event.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingEvent ? `/api/admin/schedule-events/${editingEvent.id}` : "/api/admin/schedule-events"
      const method = editingEvent ? "PUT" : "POST"

      const payload = {
        title: formData.title,
        description: formData.description || null,
        start_time: toMysqlDateTime(formData.start_time),
        end_time: toMysqlDateTime(formData.end_time),
        event_type: formData.event_type,
        participants: formData.participants
          ? formData.participants
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean)
          : null,
        display_order: formData.display_order,
        ...(editingEvent ? { is_active: formData.is_active } : {}),
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({ title: "Gelukt", description: `Onderdeel ${editingEvent ? "bijgewerkt" : "toegevoegd"}` })
        fetchEvents()
        resetForm()
        setIsDialogOpen(false)
      } else {
        const result = await response.json()
        throw new Error(result.error || "Onderdeel opslaan mislukt")
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Onderdeel opslaan mislukt",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Weet je zeker dat je dit programmaonderdeel wilt verwijderen?")) return

    try {
      const response = await fetch(`/api/admin/schedule-events/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Gelukt", description: "Onderdeel verwijderd" })
        fetchEvents()
      } else {
        throw new Error("Onderdeel verwijderen mislukt")
      }
    } catch (error) {
      toast({ title: "Fout", description: "Onderdeel verwijderen mislukt", variant: "destructive" })
    }
  }

  if (loading) {
    return <div>Programma laden...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Programma</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Onderdeel toevoegen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Onderdeel bewerken" : "Programmaonderdeel toevoegen"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Omschrijving</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Starttijd *</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">Eindtijd *</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_type">Type</Label>
                    <Select
                      value={formData.event_type}
                      onValueChange={(value: ScheduleEvent["event_type"]) =>
                        setFormData({ ...formData, event_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="music">Muziek</SelectItem>
                        <SelectItem value="talk">Gesprek</SelectItem>
                        <SelectItem value="break">Pauze</SelectItem>
                        <SelectItem value="special">Speciaal</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <Label htmlFor="participants">Deelnemers (gescheiden door komma's)</Label>
                  <Input
                    id="participants"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    placeholder="Presentator, gastspreker"
                  />
                </div>

                {editingEvent && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Actief</Label>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuleren
                  </Button>
                  <Button type="submit">{editingEvent ? "Bijwerken" : "Toevoegen"} Event</Button>
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
              <TableHead>Titel</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>Einde</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{new Date(event.start_time).toLocaleString("nl-NL")}</TableCell>
                <TableCell>{new Date(event.end_time).toLocaleString("nl-NL")}</TableCell>
                <TableCell>
                  <Badge variant="outline">{event.event_type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={event.is_active ? "default" : "secondary"}>
                    {event.is_active ? "Actief" : "Inactief"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nog geen programmaonderdelen.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
