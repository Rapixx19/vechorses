/**
 * FILE: modules/horses/components/NewHorsePage.tsx
 * ZONE: Green
 * PURPOSE: Add new horse form content (extracted for SSR-safe dynamic import)
 * EXPORTS: NewHorsePage
 * DEPENDS ON: modules/horses
 * CONSUMED BY: app/horses/new/page.tsx
 * TESTS: modules/horses/tests/NewHorsePage.test.tsx
 * LAST CHANGED: 2026-03-08 — Extracted from app/horses/new/page.tsx for SSR fix
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { HorseForm } from "./HorseForm"
import { useCreateHorse, type CreateHorseInput } from "../hooks/useHorses"

export function NewHorsePage() {
  const router = useRouter()
  const { createHorse } = useCreateHorse()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CreateHorseInput) => {
    setError(null)
    setIsSubmitting(true)

    const result = await createHorse(data)

    if (result.success) {
      router.push("/horses")
    } else {
      setError(result.error || "Failed to create horse")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/horses" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Add New Horse</h2>
      </div>
      {error && (
        <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}
      <div className="rounded-lg p-6" style={{ backgroundColor: "#1A1A2E" }}>
        <HorseForm onSubmit={handleSubmit} />
        {isSubmitting && (
          <div className="mt-4 text-center text-[var(--text-muted)]">Saving...</div>
        )}
      </div>
    </div>
  )
}
