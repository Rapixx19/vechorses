/**
 * FILE: app/staff/page.tsx
 * ZONE: Green
 * PURPOSE: Staff management page route with SSR disabled
 * EXPORTS: default (StaffPageRoute)
 * DEPENDS ON: modules/staff
 * CONSUMED BY: Next.js routing
 * TESTS: app/staff/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import dynamic from "next/dynamic"

const StaffPage = dynamic(
  () => import("@/modules/staff").then((mod) => mod.StaffPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function StaffPageRoute() {
  return <StaffPage />
}
