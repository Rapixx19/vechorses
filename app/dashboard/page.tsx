/**
 * FILE: app/dashboard/page.tsx
 * ZONE: Green
 * PURPOSE: Dashboard page wrapper with SSR disabled
 * EXPORTS: default (DashboardPage)
 * DEPENDS ON: modules/dashboard
 * CONSUMED BY: Next.js routing
 * TESTS: app/dashboard/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import dynamic from "next/dynamic"

const DashboardContent = dynamic(
  () => import("@/modules/dashboard").then((mod) => mod.DashboardPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function DashboardPage() {
  return <DashboardContent />
}
