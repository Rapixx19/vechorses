/**
 * FILE: app/horses/new/page.tsx
 * ZONE: Green
 * PURPOSE: Add new horse page route with SSR disabled
 * EXPORTS: default (NewHorsePageRoute)
 * DEPENDS ON: modules/horses
 * CONSUMED BY: Next.js routing
 * TESTS: app/horses/new/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import dynamic from "next/dynamic"

const NewHorsePage = dynamic(
  () => import("@/modules/horses").then((mod) => mod.NewHorsePage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function NewHorsePageRoute() {
  return <NewHorsePage />
}
