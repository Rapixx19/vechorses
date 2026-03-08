/**
 * FILE: modules/onboarding/components/OnboardingWizard.tsx
 * ZONE: Green
 * PURPOSE: Main onboarding wizard controller with step navigation
 * EXPORTS: OnboardingWizard
 * DEPENDS ON: lib/hooks/useAuth, lib/supabase, step components
 * CONSUMED BY: app/onboarding/page.tsx
 * TESTS: modules/onboarding/tests/OnboardingWizard.test.tsx
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/hooks/useAuth"
import { createClient } from "@/lib/supabase"
import { WelcomeStep } from "./steps/WelcomeStep"
import { StableInfoStep } from "./steps/StableInfoStep"
import { AddStallsStep } from "./steps/AddStallsStep"
import { AddFirstHorseStep } from "./steps/AddFirstHorseStep"
import { AddFirstClientStep } from "./steps/AddFirstClientStep"
import { AddServicesStep } from "./steps/AddServicesStep"
import { InviteTeamStep } from "./steps/InviteTeamStep"
import { CompleteStep } from "./steps/CompleteStep"

// BREADCRUMB: Step configuration
const STEPS = [
  { id: 0, component: WelcomeStep, title: "Welcome" },
  { id: 1, component: StableInfoStep, title: "Stable Info" },
  { id: 2, component: AddStallsStep, title: "Add Stalls" },
  { id: 3, component: AddFirstHorseStep, title: "First Horse" },
  { id: 4, component: AddFirstClientStep, title: "First Client" },
  { id: 5, component: AddServicesStep, title: "Services" },
  { id: 6, component: InviteTeamStep, title: "Invite Team" },
  { id: 7, component: CompleteStep, title: "Complete" },
] as const

export interface OnboardingStepProps {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  isFirstStep: boolean
  isLastStep: boolean
  stableId: string
}

export function OnboardingWizard() {
  const { currentUser, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [skippedSteps, setSkippedSteps] = useState<number[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  // BREADCRUMB: Load saved onboarding progress
  useEffect(() => {
    if (!currentUser?.stableId || isInitialized) return

    async function loadProgress() {
      const { data } = await supabase
        .from("stables")
        .select("onboarding_step, onboarding_completed")
        .eq("id", currentUser!.stableId)
        .single()

      if (data) {
        if (data.onboarding_completed) {
          router.push("/dashboard")
          return
        }
        setCurrentStep(data.onboarding_step || 0)
      }
      setIsInitialized(true)
    }

    loadProgress()
  }, [currentUser?.stableId, supabase, router, isInitialized])

  // BREADCRUMB: Save progress after each step
  const saveProgress = useCallback(
    async (step: number) => {
      if (!currentUser?.stableId) return
      await supabase
        .from("stables")
        .update({ onboarding_step: step })
        .eq("id", currentUser.stableId)
    },
    [currentUser?.stableId, supabase]
  )

  const handleNext = useCallback(() => {
    const nextStep = Math.min(currentStep + 1, STEPS.length - 1)
    setCurrentStep(nextStep)
    saveProgress(nextStep)
  }, [currentStep, saveProgress])

  const handleBack = useCallback(() => {
    const prevStep = Math.max(currentStep - 1, 0)
    setCurrentStep(prevStep)
  }, [currentStep])

  const handleSkip = useCallback(() => {
    setSkippedSteps((prev) => [...prev, currentStep])
    handleNext()
  }, [currentStep, handleNext])

  const handleComplete = useCallback(async () => {
    if (!currentUser?.stableId) return
    await supabase
      .from("stables")
      .update({ onboarding_completed: true, onboarding_step: STEPS.length })
      .eq("id", currentUser.stableId)
    router.push("/dashboard")
  }, [currentUser?.stableId, supabase, router])

  const handleSkipAll = useCallback(async () => {
    if (!currentUser?.stableId) return
    await supabase
      .from("stables")
      .update({ onboarding_completed: true, onboarding_step: STEPS.length })
      .eq("id", currentUser.stableId)
    router.push("/dashboard")
  }, [currentUser?.stableId, supabase, router])

  // Loading state
  if (authLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F1117" }}>
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  // Not logged in
  if (!currentUser) {
    router.push("/login")
    return null
  }

  const StepComponent = STEPS[currentStep].component
  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0F1117" }}>
      {/* Header with progress */}
      <div className="border-b border-gray-800 bg-[#1A1A2E]">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2C5F2E] flex items-center justify-center">
                <span className="text-lg font-bold text-white">V</span>
              </div>
              <span className="text-sm text-gray-400">
                Step {currentStep + 1} of {STEPS.length}
              </span>
            </div>
            {currentStep < STEPS.length - 1 && (
              <button
                onClick={handleSkipAll}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Skip Setup
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#2C5F2E]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          {/* Step dots (mobile) */}
          <div className="flex justify-center gap-2 mt-3 md:hidden">
            {STEPS.map((step, idx) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep
                    ? "bg-[#2C5F2E]"
                    : idx < currentStep
                      ? "bg-[#2C5F2E]/50"
                      : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <StepComponent
              onNext={currentStep === STEPS.length - 1 ? handleComplete : handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
              isFirstStep={currentStep === 0}
              isLastStep={currentStep === STEPS.length - 1}
              stableId={currentUser.stableId || ""}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
