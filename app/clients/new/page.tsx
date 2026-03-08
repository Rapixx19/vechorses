/**
 * FILE: app/clients/new/page.tsx
 * ZONE: Green
 * PURPOSE: Add new client page route with SSR disabled
 * EXPORTS: default (NewClientPageRoute)
 * DEPENDS ON: modules/clients
 * CONSUMED BY: Next.js routing
 * TESTS: app/clients/new/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import dynamic from "next/dynamic"

const NewClientPage = dynamic(
  () => import("@/modules/clients").then((mod) => mod.NewClientPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function NewClientPageRoute() {
  return <NewClientPage />
}
