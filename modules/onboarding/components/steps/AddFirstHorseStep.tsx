/**
 * FILE: modules/onboarding/components/steps/AddFirstHorseStep.tsx
 * ZONE: Green
 * PURPOSE: Add first horse step for onboarding
 * EXPORTS: AddFirstHorseStep
 * DEPENDS ON: lib/supabase
 * CONSUMED BY: OnboardingWizard
 * TESTS: None
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { OnboardingStepProps } from "../OnboardingWizard"

interface HorseInput {
  name: string
  breed: string
  dateOfBirth: string
  stallId: string
  color: string
}

interface Stall {
  id: string
  label: string
}

export function AddFirstHorseStep({ onNext, onBack, onSkip, stableId }: OnboardingStepProps) {
  const supabase = useMemo(() => createClient(), [])
  const [isLoading, setIsLoading] = useState(false)
  const [stalls, setStalls] = useState<Stall[]>([])
  const [horses, setHorses] = useState<HorseInput[]>([
    { name: "", breed: "", dateOfBirth: "", stallId: "", color: "" },
  ])
  const [addedHorses, setAddedHorses] = useState<string[]>([])

  // Load available stalls
  useEffect(() => {
    if (!stableId) return

    async function loadStalls() {
      const { data } = await supabase
        .from("stalls")
        .select("id, label")
        .eq("stable_id", stableId)
        .order("position")

      if (data) {
        setStalls(data)
      }
    }

    loadStalls()
  }, [stableId, supabase])

  const handleAddHorse = () => {
    setHorses([...horses, { name: "", breed: "", dateOfBirth: "", stallId: "", color: "" }])
  }

  const handleRemoveHorse = (index: number) => {
    setHorses(horses.filter((_, i) => i !== index))
  }

  const handleChange = (index: number, field: keyof HorseInput, value: string) => {
    const updated = [...horses]
    updated[index] = { ...updated[index], [field]: value }
    setHorses(updated)
  }

  const handleSave = async () => {
    if (!stableId) return

    const validHorses = horses.filter((h) => h.name.trim())
    if (validHorses.length === 0) {
      onNext()
      return
    }

    setIsLoading(true)

    for (const horse of validHorses) {
      const { error } = await supabase.from("horses").insert({
        stable_id: stableId,
        name: horse.name,
        breed: horse.breed || null,
        date_of_birth: horse.dateOfBirth || null,
        stall_id: horse.stallId || null,
        color: horse.color || null,
        is_active: true,
      })

      if (!error) {
        setAddedHorses((prev) => [...prev, horse.name])
      }
    }

    setIsLoading(false)
    onNext()
  }

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-[#252538] border border-[#2a2a3e] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2C5F2E] text-sm"

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#2C5F2E]/20 flex items-center justify-center">
          <span className="text-2xl">🐴</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Add your first horse</h2>
          <p className="text-gray-400 text-sm">You can add more from the Horses section</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {horses.map((horse, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1A2E] rounded-xl p-4 border border-[#2a2a3e]"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Horse {index + 1}</span>
              {horses.length > 1 && (
                <button
                  onClick={() => handleRemoveHorse(index)}
                  className="p-1 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Horse name *</label>
                <input
                  type="text"
                  value={horse.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  className={inputClass}
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Breed</label>
                <input
                  type="text"
                  value={horse.breed}
                  onChange={(e) => handleChange(index, "breed", e.target.value)}
                  className={inputClass}
                  placeholder="Breed"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date of birth</label>
                <input
                  type="date"
                  value={horse.dateOfBirth}
                  onChange={(e) => handleChange(index, "dateOfBirth", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Stall</label>
                <select
                  value={horse.stallId}
                  onChange={(e) => handleChange(index, "stallId", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select stall</option>
                  {stalls.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Color/markings</label>
                <input
                  type="text"
                  value={horse.color}
                  onChange={(e) => handleChange(index, "color", e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Bay with white blaze"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleAddHorse}
        className="flex items-center gap-2 text-sm text-[#2C5F2E] hover:text-green-400 transition-colors mb-6"
      >
        <Plus className="h-4 w-4" />
        Add Another Horse
      </button>

      {addedHorses.length > 0 && (
        <div className="bg-[#252538] rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-400">
            Added: {addedHorses.join(", ")}
          </p>
        </div>
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
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-1 px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: "#2C5F2E" }}
          >
            {isLoading ? "Saving..." : "Continue"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
