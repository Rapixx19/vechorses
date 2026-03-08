/**
 * FILE: app/settings/page.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Settings page route with SSR disabled
 * EXPORTS: default (SettingsPageRoute)
 * DEPENDS ON: modules/settings
 * CONSUMED BY: Next.js routing
 * TESTS: app/settings/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

// 🔴 RED ZONE — billing settings, handle with care

"use client"

import dynamic from "next/dynamic"

const SettingsPage = dynamic(
  () => import("@/modules/settings").then((mod) => mod.SettingsPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function SettingsPageRoute() {
  return <SettingsPage />
}
