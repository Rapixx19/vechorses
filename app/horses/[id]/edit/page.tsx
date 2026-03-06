/**
 * FILE: app/horses/[id]/edit/page.tsx
 * ZONE: Green
 * PURPOSE: Edit horse form page
 * EXPORTS: default (EditHorsePage)
 * DEPENDS ON: modules/horses
 * CONSUMED BY: Next.js routing
 * TESTS: app/horses/[id]/edit/page.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useHorses, HorseForm } from "@/modules/horses"
import { use } from "react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditHorsePage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const horses = useHorses()
  const horse = horses.find((h) => h.id === id)

  const handleSubmit = (data: Parameters<typeof HorseForm>[0] extends { onSubmit: (d: infer T) => void } ? T : never) => {
    // BREADCRUMB: V1 mock - just log and redirect. Real save comes in Phase 2
    console.log("Update horse:", id, data)
    router.push(`/horses/${id}`)
  }

  if (!horse) {
    return <p className="text-red-400">Horse not found</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/horses/${id}`} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
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
