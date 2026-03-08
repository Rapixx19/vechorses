/**
 * FILE: app/assistant/page.tsx
 * ZONE: Green
 * PURPOSE: AI Assistant page route with SSR disabled
 * EXPORTS: default (page component)
 * DEPENDS ON: modules/assistant
 * CONSUMED BY: Next.js App Router
 * TESTS: None (route handler)
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import dynamic from "next/dynamic"

const AssistantPage = dynamic(
  () => import("@/modules/assistant").then((mod) => mod.AssistantPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function AssistantRoute() {
  return <AssistantPage />
}
