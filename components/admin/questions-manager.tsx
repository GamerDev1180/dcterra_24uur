"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Camera, AlertCircle } from "lucide-react"

interface Question {
  id: number
  question_text: string
  question_type: "text" | "textarea" | "select" | "radio" | "checkbox"
  options?: string[]
  required: boolean
  category: "on_camera" | "off_camera"
  order_index: number
  active: boolean
  created_at: string
}

const QUESTION_CATEGORY = "on_camera" as const

export function QuestionsManager() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "text" as Question["question_type"],
    options: "",
    required: true,
    category: QUESTION_CATEGORY as Question["category"],
    order_index: 0,
    active: true,
  })

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/admin/questions")
      const data = await response.json()

      if (response.ok) {
        setQuestions(data.questions)
      } else {
        setError(data.error || "Vragen laden mislukt")
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error)
      setError("Netwerkfout. Probeer het opnieuw.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      question_text: "",
      question_type: "text",
      options: "",
      required: true,
      category: QUESTION_CATEGORY,
      order_index: 0,
      active: true,
    })
    setEditingQuestion(null)
  }

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question)
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      options: question.options?.join(", ") || "",
      required: question.required,
      category: QUESTION_CATEGORY,
      order_index: question.order_index,
      active: question.active,
    })
    setDialogOpen(true)
  }

  const saveQuestion = async () => {
    if (!formData.question_text.trim()) {
      setError("Vul een vraag in")
      return
    }

    try {
      const url = editingQuestion ? `/api/admin/questions/${editingQuestion.id}` : "/api/admin/questions"

      const method = editingQuestion ? "PUT" : "POST"

      const payload = {
        ...formData,
        options:
          ["select", "radio", "checkbox"].includes(formData.question_type) && formData.options
            ? formData.options
                .split(",")
                .map((opt) => opt.trim())
                .filter(Boolean)
            : null,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(editingQuestion ? "Vraag bijgewerkt" : "Vraag toegevoegd")
        setDialogOpen(false)
        resetForm()
        await fetchQuestions()
      } else {
        setError(result.error || "Vraag opslaan mislukt")
      }
    } catch (error) {
      setError("Netwerkfout. Probeer het opnieuw.")
    }
  }

  const deleteQuestion = async (id: number) => {
    if (!confirm("Weet je zeker dat je deze vraag wilt verwijderen?")) return

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Vraag verwijderd")
        await fetchQuestions()
      } else {
        setError("Vraag verwijderen mislukt")
      }
    } catch (error) {
      setError("Netwerkfout. Probeer het opnieuw.")
    }
  }

  const onCameraQuestions = questions.filter((q) => q.category === "on_camera")

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

      {/* Add Question Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Aanmeldvragen</h3>
          <p className="text-muted-foreground">Beheer de vragen voor deelnemers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Vraag toevoegen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? "Vraag bewerken" : "Nieuwe vraag toevoegen"}</DialogTitle>
              <DialogDescription>Maak of wijzig de vragen voor deelnemers</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="question_text">Vraag *</Label>
                <Textarea
                  id="question_text"
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  placeholder="Typ je vraag..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="question_type">Soort vraag</Label>
                <Select
                  value={formData.question_type}
                  onValueChange={(value: Question["question_type"]) =>
                    setFormData({ ...formData, question_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Korte tekst</SelectItem>
                    <SelectItem value="textarea">Lange tekst</SelectItem>
                    <SelectItem value="select">Keuzelijst</SelectItem>
                    <SelectItem value="radio">Eén keuze (rondjes)</SelectItem>
                    <SelectItem value="checkbox">Meerkeuze (vinkjes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {["select", "radio", "checkbox"].includes(formData.question_type) && (
                <div>
                  <Label htmlFor="options">Opties (gescheiden door komma's)</Label>
                  <Textarea
                    id="options"
                    value={formData.options}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    placeholder="Optie 1, Optie 2, Optie 3"
                    rows={2}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order_index">Volgorde</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="required"
                      checked={formData.required}
                      onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
                    />
                    <Label htmlFor="required">Verplicht</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                    <Label htmlFor="active">Actief</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button onClick={saveQuestion}>{editingQuestion ? "Vraag bijwerken" : "Vraag toevoegen"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* On Camera Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Vragen voor deelnemers</span>
          </CardTitle>
          <CardDescription>Vragen die deelnemers beantwoorden bij hun aanmelding</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Volgorde</TableHead>
                <TableHead>Vraag</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Verplicht</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {onCameraQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>{question.order_index}</TableCell>
                  <TableCell className="max-w-xs truncate">{question.question_text}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{question.question_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={question.required ? "default" : "secondary"}>
                      {question.required ? "Verplicht" : "Optioneel"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={question.active ? "default" : "secondary"}>
                      {question.active ? "Actief" : "Inactief"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(question)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteQuestion(question.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {onCameraQuestions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Nog geen vragen ingesteld.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
