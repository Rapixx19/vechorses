/**
 * FILE: modules/onboarding/components/steps/WelcomeStep.tsx
 * ZONE: Green
 * PURPOSE: Welcome step of onboarding wizard
 * EXPORTS: WelcomeStep
 * DEPENDS ON: framer-motion, lib/hooks/useAuth
 * CONSUMED BY: OnboardingWizard
 * TESTS: None
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import type { OnboardingStepProps } from "../OnboardingWizard"

export function WelcomeStep({ onNext, onSkip }: OnboardingStepProps) {
  const { currentUser } = useAuth()
  const firstName = currentUser?.fullName?.split(" ")[0] || "there"

  return (
    <div className="text-center">
      {/* Animated horse icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#2C5F2E] to-[#1a3a1c] flex items-center justify-center shadow-2xl"
      >
        <motion.span
          className="text-6xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          🐴
        </motion.span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Welcome to VecHorses, {firstName}!
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Let&apos;s set up your stable in just a few minutes.
          <br />
          You can skip any step and come back later.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#1A1A2E] rounded-xl p-6 mb-8 border border-gray-800"
      >
        <div className="flex items-center justify-center gap-2 text-[#2C5F2E] mb-3">
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">What you&apos;ll set up</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🏠</span>
            <span>Stable Info</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🐴</span>
            <span>Horses</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">👥</span>
            <span>Clients</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">💼</span>
            <span>Services</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col gap-3"
      >
        <button
          onClick={onNext}
          className="w-full py-4 rounded-xl text-lg font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#2C5F2E]/20"
          style={{ backgroundColor: "#2C5F2E" }}
        >
          Let&apos;s Get Started
        </button>
        <button
          onClick={onSkip}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Skip Setup — Go to Dashboard
        </button>
      </motion.div>
    </div>
  )
}
