/**
 * FILE: modules/onboarding/components/steps/AddStallsStep.tsx
 * ZONE: Green
 * PURPOSE: Add stalls step for onboarding
 * EXPORTS: AddStallsStep
 * DEPENDS ON: lib/supabase
 * CONSUMED BY: OnboardingWizard
 * TESTS: None
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Home, ChevronLeft, ChevronRight, Plus, Minus, Check } from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { OnboardingStepProps } from "../OnboardingWizard"

export function AddStallsStep({ onNext, onBack, onSkip, stableId }: OnboardingStepProps) {
  const supabase = useMemo(() => createClient(), [])
  const [stallCount, setStallCount] = useState(8)
  const [prefix, setPrefix] = useState("Box")
  const [isLoading, setIsLoading] = useState(false)
  const [isCreated, setIsCreated] = useState(false)

  const handleGenerate = async () => {
    if (!stableId || stallCount < 1) return

    setIsLoading(true)

    // Generate stall data
    const stalls = Array.from({ length: stallCount }, (_, i) => ({
      stable_id: stableId,
      label: `${prefix} ${i + 1}`,
      type: "standard",
      position: i,
      row_index: Math.floor(i / 4),
      col_index: i % 4,
      grid_cols: 4,
      is_maintenance: false,
    }))

    const { error } = await supabase.from("stalls").insert(stalls)

    if (error) {
      console.error("Failed to create stalls:", error)
    } else {
      setIsCreated(true)
    }

    setIsLoading(false)
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-[#252538] border border-[#2a2a3e] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2C5F2E] text-sm"

  // Generate preview grid
  const previewStalls = Array.from({ length: Math.min(stallCount, 12) }, (_, i) => `${prefix} ${i + 1}`)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#2C5F2E]/20 flex items-center justify-center">
          <Home className="h-6 w-6 text-[#2C5F2E]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Add your stalls</h2>
          <p className="text-gray-400 text-sm">Let&apos;s add your stalls quickly</p>
        </div>
      </div>

      {!isCreated ? (
        <>
          <div className="bg-[#1A1A2E] rounded-xl p-6 mb-6 border border-[#2a2a3e]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Number of stalls</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStallCount(Math.max(1, stallCount - 1))}
                    className="p-2 rounded-lg bg-[#252538] text-gray-400 hover:text-white transition-colors"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <input
                    type="number"
                    value={stallCount}
                    onChange={(e) => setStallCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center px-3 py-2 rounded-lg bg-[#252538] border border-[#2a2a3e] text-white text-lg font-semibold"
                    min="1"
                    max="100"
                  />
                  <button
                    onClick={() => setStallCount(Math.min(100, stallCount + 1))}
                    className="p-2 rounded-lg bg-[#252538] text-gray-400 hover:text-white transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className={inputClass}
                  placeholder="Box"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Generates: {prefix} 1, {prefix} 2, {prefix} 3...
                </p>
              </div>
            </div>

            {/* Preview grid */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Preview</label>
              <div className="grid grid-cols-4 gap-2">
                {previewStalls.map((name, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="p-3 rounded-lg bg-[#252538] border border-[#2a2a3e] text-center"
                  >
                    <span className="text-sm text-gray-300">{name}</span>
                  </motion.div>
                ))}
                {stallCount > 12 && (
                  <div className="p-3 rounded-lg bg-[#252538] border border-[#2a2a3e] text-center">
                    <span className="text-sm text-gray-500">+{stallCount - 12} more</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prefix}
            className="w-full py-3 rounded-lg text-sm font-medium text-white mb-6 disabled:opacity-50 transition-colors"
            style={{ backgroundColor: "#2C5F2E" }}
          >
            {isLoading ? "Creating stalls..." : `Generate ${stallCount} Stalls`}
          </button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1A1A2E] rounded-xl p-8 mb-6 border border-[#2C5F2E] text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2C5F2E]/20 flex items-center justify-center">
            <Check className="h-8 w-8 text-[#2C5F2E]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {stallCount} stalls created!
          </h3>
          <p className="text-gray-400 text-sm">You can manage them in the Stalls section</p>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <button onClick={onSkip} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Skip
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-1 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#2C5F2E" }}
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
