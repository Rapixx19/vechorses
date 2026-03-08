/**
 * FILE: app/documents/page.tsx
 * ZONE: Green
 * PURPOSE: Documents page route with SSR disabled
 * EXPORTS: default (DocumentsPageRoute)
 * DEPENDS ON: modules/documents
 * CONSUMED BY: Next.js routing
 * TESTS: app/documents/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import dynamic from "next/dynamic"

const DocumentsPage = dynamic(
  () => import("@/modules/documents").then((mod) => mod.DocumentsPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function DocumentsPageRoute() {
  return <DocumentsPage />
}
