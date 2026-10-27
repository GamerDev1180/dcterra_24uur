"use client"

import { useState } from "react"
import { Check, User, ClipboardList, Send } from "lucide-react"
import { PersonalInfoStep } from "./registration-steps/personal-info-step"
import { QuestionsStep } from "./registration-steps/questions-step"
import { ConfirmationStep } from "./registration-steps/confirmation-step"
import { cn } from "@/lib/utils"

export interface RegistrationData {
  name: string
  email: string
  answers: Record<number, string>
}

const steps = [
  { id: 1, title: "Jouw gegevens", short: "Gegevens", icon: User, description: "Naam en DCTerra-mailadres" },
  { id: 2, title: "Een paar vragen", short: "Vragen", icon: ClipboardList, description: "Zodat we goed voor je kunnen zorgen" },
  { id: 3, title: "Controleren en versturen", short: "Versturen", icon: Send, description: "Klopt alles? Dan ben je er bijna!" },
]

export function RegistrationFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [registrationData, setRegistrationData] = useState<RegistrationData>({ name: "", email: "", answers: {} })

  const updateRegistrationData = (data: Partial<RegistrationData>) => setRegistrationData((prev) => ({ ...prev, ...data }))

  const goTo = (step: number) => {
    setCurrentStep(step)
    if (typeof window !== "undefined") {
      document.getElementById("aanmelden")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const current = steps[currentStep - 1]

  return (
    <div id="aanmelden" className="scroll-mt-28">
      {/* Stappen */}
      <ol className="flex items-center mb-6" aria-label="Voortgang">
        {steps.map((step, i) => {
          const done = currentStep > step.id
          const active = currentStep === step.id
          const StepIcon = step.icon
          return (
            <li key={step.id} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
              <div className="flex items-center gap-2">
                <span
                  className={cn("step-indicator", active ? "active" : done ? "completed" : "inactive")}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check className="size-4" /> : <StepIcon className="size-4" />}
                </span>
                <span
                  className={cn(
                    "hidden sm:block text-sm font-bold",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.short}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-3 h-1 flex-1 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-success transition-all duration-500"
                    style={{ width: done ? "100%" : "0%" }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>

      <div key={currentStep} className="rounded-3xl bg-card border border-border p-6 md:p-8 shadow-sm animate-fade-in">
        <div className="mb-6">
          <p className="text-sm font-bold text-primary">
            Stap {currentStep} van {steps.length}
          </p>
          <h2 className="text-2xl font-bold mt-1">{current.title}</h2>
          <p className="text-muted-foreground">{current.description}</p>
        </div>

        {currentStep === 1 && (
          <PersonalInfoStep data={registrationData} onUpdate={updateRegistrationData} onNext={() => goTo(2)} />
        )}
        {currentStep === 2 && (
          <QuestionsStep
            data={registrationData}
            onUpdate={updateRegistrationData}
            onNext={() => goTo(3)}
            onPrev={() => goTo(1)}
          />
        )}
        {currentStep === 3 && <ConfirmationStep data={registrationData} onPrev={() => goTo(2)} />}
      </div>
    </div>
  )
}
