/**
 * FILE: app/horses/new/page.tsx
 * ZONE: Green
 * PURPOSE: Add new horse form page
 * EXPORTS: default (NewHorsePage)
 * DEPENDS ON: modules/horses
 * CONSUMED BY: Next.js routing
 * TESTS: app/horses/new/page.test.tsx
 * LAST CHANGED: 2026-03-07 — Wired to Supabase via useCreateHorse
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { HorseForm, useCreateHorse, type CreateHorseInput } from "@/modules/horses"

export default function NewHorsePage() {
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
