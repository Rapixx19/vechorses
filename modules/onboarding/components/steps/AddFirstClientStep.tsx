/**
 * FILE: modules/onboarding/components/steps/AddFirstClientStep.tsx
 * ZONE: Green
 * PURPOSE: Add first client step for onboarding
 * EXPORTS: AddFirstClientStep
 * DEPENDS ON: lib/supabase
 * CONSUMED BY: OnboardingWizard
 * TESTS: None
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Users, ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { OnboardingStepProps } from "../OnboardingWizard"

interface ClientInput {
  fullName: string
  email: string
  phone: string
}

export function AddFirstClientStep({ onNext, onBack, onSkip, stableId }: OnboardingStepProps) {
  const supabase = useMemo(() => createClient(), [])
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<ClientInput[]>([{ fullName: "", email: "", phone: "" }])
  const [addedClients, setAddedClients] = useState<string[]>([])

  const handleAddClient = () => {
    setClients([...clients, { fullName: "", email: "", phone: "" }])
  }

  const handleRemoveClient = (index: number) => {
    setClients(clients.filter((_, i) => i !== index))
  }

  const handleChange = (index: number, field: keyof ClientInput, value: string) => {
    const updated = [...clients]
    updated[index] = { ...updated[index], [field]: value }
    setClients(updated)
  }

  const handleSave = async () => {
    if (!stableId) return

    const validClients = clients.filter((c) => c.fullName.trim() && c.email.trim())
    if (validClients.length === 0) {
      onNext()
      return
    }

    setIsLoading(true)

    for (const client of validClients) {
      const { error } = await supabase.from("clients").insert({
        stable_id: stableId,
        full_name: client.fullName,
        email: client.email,
        phone: client.phone || null,
        is_active: true,
      })

      if (!error) {
        setAddedClients((prev) => [...prev, client.fullName])
      }
    }

    setIsLoading(false)
    onNext()
  }

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-[#252538] border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2C5F2E] text-sm"

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#2C5F2E]/20 flex items-center justify-center">
          <Users className="h-6 w-6 text-[#2C5F2E]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Add your first client</h2>
          <p className="text-gray-400 text-sm">Horse owners you work with</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {clients.map((client, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1A2E] rounded-xl p-4 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Client {index + 1}</span>
              {clients.length > 1 && (
                <button
                  onClick={() => handleRemoveClient(index)}
                  className="p-1 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Full name *</label>
                <input
                  type="text"
                  value={client.fullName}
                  onChange={(e) => handleChange(index, "fullName", e.target.value)}
                  className={inputClass}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email *</label>
                <input
                  type="email"
                  value={client.email}
                  onChange={(e) => handleChange(index, "email", e.target.value)}
                  className={inputClass}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                <input
                  type="tel"
                  value={client.phone}
                  onChange={(e) => handleChange(index, "phone", e.target.value)}
                  className={inputClass}
                  placeholder="+41 XX XXX XX XX"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleAddClient}
        className="flex items-center gap-2 text-sm text-[#2C5F2E] hover:text-green-400 transition-colors mb-6"
      >
        <Plus className="h-4 w-4" />
        Add Another Client
      </button>

      {addedClients.length > 0 && (
        <div className="bg-[#252538] rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-400">Added: {addedClients.join(", ")}</p>
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
