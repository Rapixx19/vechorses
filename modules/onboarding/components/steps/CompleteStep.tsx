/**
 * FILE: modules/onboarding/components/steps/CompleteStep.tsx
 * ZONE: Green
 * PURPOSE: Completion step for onboarding
 * EXPORTS: CompleteStep
 * DEPENDS ON: framer-motion
 * CONSUMED BY: OnboardingWizard
 * TESTS: None
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { motion } from "framer-motion"
import { Calendar, FileText, CreditCard, ArrowRight } from "lucide-react"
import type { OnboardingStepProps } from "../OnboardingWizard"

const NEXT_STEPS = [
  {
    icon: Calendar,
    title: "Set up your calendar",
    description: "Schedule events and appointments",
    color: "#3b82f6",
  },
  {
    icon: FileText,
    title: "Upload documents",
    description: "Add contracts, passports, and more",
    color: "#8b5cf6",
  },
  {
    icon: CreditCard,
    title: "Create your first invoice",
    description: "Start billing your clients",
    color: "#10b981",
  },
]

export function CompleteStep({ onNext }: OnboardingStepProps) {
  return (
    <div className="text-center">
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#2C5F2E] to-[#1a3a1c] flex items-center justify-center shadow-2xl"
      >
        <motion.span
          className="text-5xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          🎉
        </motion.span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">You&apos;re all set!</h2>
        <p className="text-gray-400 mb-8">
          Your stable is ready. Here are some things you can do next.
        </p>
      </motion.div>

      {/* Next steps cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {NEXT_STEPS.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="bg-[#1A1A2E] rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer group"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto"
              style={{ backgroundColor: `${step.color}20` }}
            >
              <step.icon className="h-5 w-5" style={{ color: step.color }} />
            </div>
            <h3 className="font-medium text-white text-sm mb-1">{step.title}</h3>
            <p className="text-xs text-gray-500">{step.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Go to dashboard button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <button
          onClick={onNext}
          className="w-full md:w-auto px-8 py-4 rounded-xl text-lg font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#2C5F2E]/20 flex items-center justify-center gap-2 mx-auto"
          style={{ backgroundColor: "#2C5F2E" }}
        >
          Go to Dashboard
          <ArrowRight className="h-5 w-5" />
        </button>
      </motion.div>
    </div>
  )
}
