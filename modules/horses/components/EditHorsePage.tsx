/**
 * FILE: modules/horses/components/EditHorsePage.tsx
 * ZONE: Green
 * PURPOSE: Edit horse form content (extracted for SSR-safe dynamic import)
 * EXPORTS: EditHorsePage
 * DEPENDS ON: modules/horses
 * CONSUMED BY: app/horses/[id]/edit/page.tsx
 * TESTS: modules/horses/tests/EditHorsePage.test.tsx
 * LAST CHANGED: 2026-03-08 — Extracted from app/horses/[id]/edit/page.tsx for SSR fix
 */

"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { HorseForm } from "./HorseForm"
import { useHorses } from "../hooks/useHorses"

interface EditHorsePageProps {
  horseId: string
}

export function EditHorsePage({ horseId }: EditHorsePageProps) {
  const router = useRouter()
  const { horses, isLoading } = useHorses()
  const horse = horses.find((h) => h.id === horseId)

  const handleSubmit = (data: Parameters<typeof HorseForm>[0] extends { onSubmit: (d: infer T) => void } ? T : never) => {
    // BREADCRUMB: V1 mock - just log and redirect. Real save comes in Phase 2
    console.log("Update horse:", horseId, data)
    router.push(`/horses/${horseId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C5F2E]" />
      </div>
    )
  }

  if (!horse) {
    return <p className="text-red-400">Horse not found</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/horses/${horseId}`} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Edit {horse.name}</h2>
      </div>
      <div className="rounded-lg p-6" style={{ backgroundColor: "#1A1A2E" }}>
        <HorseForm initialData={horse} onSubmit={handleSubmit} isEditing />
      </div>
    </div>
  )
}
