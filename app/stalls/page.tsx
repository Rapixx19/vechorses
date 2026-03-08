/**
 * FILE: app/stalls/page.tsx
 * ZONE: Green
 * PURPOSE: Visual stall grid page with SSR disabled
 * EXPORTS: default (StallsPage)
 * DEPENDS ON: modules/stalls
 * CONSUMED BY: Next.js routing
 * TESTS: app/stalls/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import dynamic from "next/dynamic"

const StallSummary = dynamic(
  () => import("@/modules/stalls").then((mod) => mod.StallSummary),
  { ssr: false }
)

const StallGrid = dynamic(
  () => import("@/modules/stalls").then((mod) => mod.StallGrid),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function StallsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Stalls</h2>
      <StallSummary />
      <StallGrid />
    </div>
  )
}
