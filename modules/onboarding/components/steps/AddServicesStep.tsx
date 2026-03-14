/**
 * FILE: modules/onboarding/components/steps/AddServicesStep.tsx
 * ZONE: Green
 * PURPOSE: Add services step for onboarding
 * EXPORTS: AddServicesStep
 * DEPENDS ON: lib/supabase
 * CONSUMED BY: OnboardingWizard
 * TESTS: None
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Briefcase, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { OnboardingStepProps } from "../OnboardingWizard"

// BREADCRUMB: Service templates
const SERVICE_TEMPLATES = [
  {
    id: "boarding",
    icon: "🏠",
    name: "Boarding",
    description: "Monthly boarding",
    category: "boarding",
    defaultPrice: 1200,
    unit: "month",
  },
  {
    id: "lessons",
    icon: "🎓",
    name: "Lessons",
    description: "Private lessons",
    category: "training",
    defaultPrice: 75,
    unit: "hour",
  },
  {
    id: "farrier",
    icon: "🔨",
    name: "Farrier",
    description: "Shoeing service",
    category: "health",
    defaultPrice: 80,
    unit: "visit",
  },
  {
    id: "vet",
    icon: "🏥",
    name: "Vet visits",
    description: "Vet assistance",
    category: "health",
    defaultPrice: 100,
    unit: "visit",
  },
  {
    id: "grooming",
    icon: "✨",
    name: "Grooming",
    description: "Full grooming",
    category: "care",
    defaultPrice: 45,
    unit: "session",
  },
  {
    id: "training",
    icon: "🏇",
    name: "Training",
    description: "Horse training",
    category: "training",
    defaultPrice: 60,
    unit: "session",
  },
]

interface SelectedService {
  id: string
  price: number
}

export function AddServicesStep({ onNext, onBack, onSkip, stableId }: OnboardingStepProps) {
  const supabase = useMemo(() => createClient(), [])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<Map<string, SelectedService>>(new Map())
  const [isCreated, setIsCreated] = useState(false)

  const toggleService = (id: string) => {
    const newMap = new Map(selectedServices)
    if (newMap.has(id)) {
      newMap.delete(id)
    } else {
      const template = SERVICE_TEMPLATES.find((t) => t.id === id)!
      newMap.set(id, { id, price: template.defaultPrice })
    }
    setSelectedServices(newMap)
  }

  const updatePrice = (id: string, price: number) => {
    const newMap = new Map(selectedServices)
    const existing = newMap.get(id)
    if (existing) {
      newMap.set(id, { ...existing, price })
      setSelectedServices(newMap)
    }
  }

  const handleSave = async () => {
    if (!stableId || selectedServices.size === 0) {
      onNext()
      return
    }

    setIsLoading(true)

    const services = Array.from(selectedServices.entries()).map(([id, selected]) => {
      const template = SERVICE_TEMPLATES.find((t) => t.id === id)!
      return {
        stable_id: stableId,
        name: template.name,
        description: template.description,
        category: template.category,
        price: selected.price * 100, // Convert to cents
        currency: "EUR",
        unit: template.unit,
        is_active: true,
      }
    })

    const { error } = await supabase.from("services").insert(services)

    if (!error) {
      setIsCreated(true)
    }

    setIsLoading(false)
    onNext()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#2C5F2E]/20 flex items-center justify-center">
          <Briefcase className="h-6 w-6 text-[#2C5F2E]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">What services does your stable offer?</h2>
          <p className="text-gray-400 text-sm">Select services and set your prices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {SERVICE_TEMPLATES.map((template) => {
          const isSelected = selectedServices.has(template.id)
          const selected = selectedServices.get(template.id)

          return (
            <motion.div
              key={template.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleService(template.id)}
              className={`relative p-4 rounded-xl cursor-pointer transition-all border ${
                isSelected
                  ? "bg-[#2C5F2E]/20 border-[#2C5F2E]"
                  : "bg-[#1A1A2E] border-[#2a2a3e] hover:border-[#3a3a4e]"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#2C5F2E] flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}

              <div className="flex items-start gap-3">
                <span className="text-2xl">{template.icon}</span>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{template.name}</h3>
                  <p className="text-xs text-gray-400">{template.description}</p>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-gray-400 text-sm">€</span>
                      <input
                        type="number"
                        value={selected?.price || template.defaultPrice}
                        onChange={(e) => updatePrice(template.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 rounded bg-[#252538] border border-[#2a2a3e] text-white text-sm"
                      />
                      <span className="text-gray-400 text-sm">/{template.unit}</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {isCreated && (
        <div className="bg-[#252538] rounded-lg p-3 mb-6">
          <p className="text-sm text-green-400">
            ✓ {selectedServices.size} services added!
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
