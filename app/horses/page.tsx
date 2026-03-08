/**
 * FILE: app/horses/page.tsx
 * ZONE: Green
 * PURPOSE: List all horses page with SSR disabled
 * EXPORTS: default (HorsesPage)
 * DEPENDS ON: modules/horses
 * CONSUMED BY: Next.js routing
 * TESTS: app/horses/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import dynamic from "next/dynamic"

const HorseList = dynamic(
  () => import("@/modules/horses").then((mod) => mod.HorseList),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function HorsesPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Horses</h2>
      <HorseList />
    </div>
  )
}
