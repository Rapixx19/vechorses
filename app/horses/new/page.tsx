/**
 * FILE: app/horses/new/page.tsx
 * ZONE: Green
 * PURPOSE: Add new horse form page
 * EXPORTS: default (NewHorsePage)
 * DEPENDS ON: modules/horses
 * CONSUMED BY: Next.js routing
 * TESTS: app/horses/new/page.test.tsx
 * LAST CHANGED: 2026-03-06 — Added HorseForm component
 */

"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { HorseForm } from "@/modules/horses"

export default function NewHorsePage() {
  const router = useRouter()

  const handleSubmit = (data: Parameters<typeof HorseForm>[0] extends { onSubmit: (d: infer T) => void } ? T : never) => {
    // BREADCRUMB: V1 mock - just log and redirect. Real save comes in Phase 2
    console.log("New horse:", data)
    router.push("/horses")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/horses" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Add New Horse</h2>
      </div>
      <div className="rounded-lg p-6" style={{ backgroundColor: "#1A1A2E" }}>
        <HorseForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
