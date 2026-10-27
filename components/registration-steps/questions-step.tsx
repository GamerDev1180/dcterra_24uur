"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react"
import type { RegistrationData } from "../registration-flow"

interface Question {
  id: number
  question_text: string
  question_type: "text" | "textarea" | "select" | "radio" | "checkbox"
  options?: string[]
  required: boolean
  order_index: number
}

interface QuestionsStepProps {
  data: RegistrationData
  onUpdate: (data: Partial<RegistrationData>) => void
  onNext: () => void
  onPrev: () => void
}

export function QuestionsStep({ data, onUpdate, onNext, onPrev }: QuestionsStepProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions")

      if (!response.ok) {
        throw new Error("Failed to fetch questions")
      }

      const result = await response.json()
      setQuestions(result.questions)
    } catch (error) {
      setError("De vragen konden niet worden geladen. Ververs de pagina en probeer het opnieuw.")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: number, answer: string) => {
    onUpdate({
      answers: {
        ...data.answers,
        [questionId]: answer,
      },
    })
  }

  const handleCheckboxChange = (questionId: number, option: string, checked: boolean) => {
    const currentAnswers = data.answers[questionId]?.split(",").filter(Boolean) || []

    let newAnswers: string[]
    if (checked) {
      newAnswers = [...currentAnswers, option]
    } else {
      newAnswers = currentAnswers.filter((a) => a !== option)
    }

    handleAnswerChange(questionId, newAnswers.join(","))
  }

  const validateAnswers = (): boolean => {
    for (const question of questions) {
      if (question.required && !data.answers[question.id]?.trim()) {
        setError(`Beantwoord: ${question.question_text}`)
        return false
      }
    }
    return true
  }

  const handleSubmit = () => {
    setError("")

    if (!validateAnswers()) {
      return
    }

    onNext()
  }

  const renderQuestion = (question: Question) => {
    const answer = data.answers[question.id] || ""

    switch (question.question_type) {
      case "text":
        return (
          <Input
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Typ hier je antwoord"
            className="rounded-xl text-base"
          />
        )

      case "textarea":
        return (
          <Textarea
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Typ hier je antwoord"
            rows={3}
            className="rounded-xl text-base"
          />
        )

      case "select":
        return (
          <Select value={answer} onValueChange={(value) => handleAnswerChange(question.id, value)}>
            <SelectTrigger className="focus-ring">
              <SelectValue placeholder="Kies een optie" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "radio":
        return (
          <RadioGroup value={answer} onValueChange={(value) => handleAnswerChange(question.id, value)}>
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        const selectedOptions = answer.split(",").filter(Boolean)
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(question.id, option, checked as boolean)}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Vragen laden...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {questions.length === 0 && !error && (
        <p className="rounded-2xl bg-muted px-5 py-4 text-muted-foreground">
          Er zijn op dit moment geen extra vragen. Ga gerust door naar de laatste stap.
        </p>
      )}

      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <Label className="text-base font-bold leading-snug">
              {question.question_text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {renderQuestion(question)}
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between">
        <Button variant="outline" size="xl" onClick={onPrev}>
          <ArrowLeft />
          Terug
        </Button>
        <Button size="xl" onClick={handleSubmit} disabled={submitting}>
          Volgende stap
          <ArrowRight />
        </Button>
      </div>
    </div>
  )
}
