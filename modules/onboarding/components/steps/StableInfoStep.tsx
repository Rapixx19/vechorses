/**
 * FILE: modules/onboarding/components/steps/StableInfoStep.tsx
 * ZONE: Green
 * PURPOSE: Stable information step for onboarding
 * EXPORTS: StableInfoStep
 * DEPENDS ON: lib/supabase, lib/hooks/useAuth
 * CONSUMED BY: OnboardingWizard
 * TESTS: None
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Building2, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { OnboardingStepProps } from "../OnboardingWizard"

const COUNTRIES = [
  "Switzerland",
  "Germany",
  "Austria",
  "France",
  "Italy",
  "United Kingdom",
  "United States",
  "Netherlands",
  "Belgium",
  "Spain",
  "Other",
]

const CURRENCIES = ["EUR", "CHF", "GBP", "USD"]

interface StableInfo {
  stableName: string
  country: string
  address: string
  city: string
  phone: string
  email: string
  vatNumber: string
  currency: string
  website: string
}

export function StableInfoStep({ onNext, onBack, onSkip, stableId }: OnboardingStepProps) {
  const supabase = useMemo(() => createClient(), [])
  const [isLoading, setIsLoading] = useState(false)
  const [info, setInfo] = useState<StableInfo>({
    stableName: "",
    country: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    vatNumber: "",
    currency: "EUR",
    website: "",
  })

  // Load existing stable info
  useEffect(() => {
    if (!stableId) return

    async function loadInfo() {
      const { data } = await supabase
        .from("stables")
        .select("stable_name, country, address, city, phone, email, vat_number, currency")
        .eq("id", stableId)
        .single()

      if (data) {
        setInfo({
          stableName: data.stable_name || "",
          country: data.country || "",
          address: data.address || "",
          city: data.city || "",
          phone: data.phone || "",
          email: data.email || "",
          vatNumber: data.vat_number || "",
          currency: data.currency || "EUR",
          website: "",
        })
      }
    }

    loadInfo()
  }, [stableId, supabase])

  const handleSave = async () => {
    if (!stableId) return

    setIsLoading(true)
    await supabase
      .from("stables")
      .update({
        stable_name: info.stableName,
        country: info.country,
        address: info.address,
        city: info.city,
        phone: info.phone,
        email: info.email,
        vat_number: info.vatNumber,
        currency: info.currency,
      })
      .eq("id", stableId)

    setIsLoading(false)
    onNext()
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-[#252538] border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2C5F2E] text-sm"

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#2C5F2E]/20 flex items-center justify-center">
          <Building2 className="h-6 w-6 text-[#2C5F2E]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Tell us about your stable</h2>
          <p className="text-gray-400 text-sm">This info appears on your invoices and documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Stable Name *</label>
          <input
            type="text"
            value={info.stableName}
            onChange={(e) => setInfo({ ...info, stableName: e.target.value })}
            className={inputClass}
            placeholder="Your Stable Name"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Country *</label>
          <select
            value={info.country}
            onChange={(e) => setInfo({ ...info, country: e.target.value })}
            className={inputClass}
          >
            <option value="">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Address</label>
          <input
            type="text"
            value={info.address}
            onChange={(e) => setInfo({ ...info, address: e.target.value })}
            className={inputClass}
            placeholder="Street address"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">City</label>
          <input
            type="text"
            value={info.city}
            onChange={(e) => setInfo({ ...info, city: e.target.value })}
            className={inputClass}
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
          <input
            type="tel"
            value={info.phone}
            onChange={(e) => setInfo({ ...info, phone: e.target.value })}
            className={inputClass}
            placeholder="+41 XX XXX XX XX"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Email</label>
          <input
            type="email"
            value={info.email}
            onChange={(e) => setInfo({ ...info, email: e.target.value })}
            className={inputClass}
            placeholder="contact@stable.com"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">VAT/Tax Number</label>
          <input
            type="text"
            value={info.vatNumber}
            onChange={(e) => setInfo({ ...info, vatNumber: e.target.value })}
            className={inputClass}
            placeholder="CHE-XXX.XXX.XXX"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Currency</label>
          <select
            value={info.currency}
            onChange={(e) => setInfo({ ...info, currency: e.target.value })}
            className={inputClass}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tips section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-[#252538] rounded-xl p-4 mb-6 border border-gray-700"
      >
        <div className="flex items-center gap-2 text-[#2C5F2E] mb-2">
          <Lightbulb className="h-4 w-4" />
          <span className="text-sm font-medium">Tips</span>
        </div>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Your stable name appears on all invoices</li>
          <li>• Add your VAT number for tax compliance</li>
          <li>• Currency is used for all billing</li>
        </ul>
      </motion.div>

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
            disabled={isLoading || !info.stableName}
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
