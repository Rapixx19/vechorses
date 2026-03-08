/**
 * FILE: app/clients/[id]/edit/page.tsx
 * ZONE: Green
 * PURPOSE: Edit client page route with SSR disabled
 * EXPORTS: default (EditClientPageRoute)
 * DEPENDS ON: modules/clients
 * CONSUMED BY: Next.js routing
 * TESTS: app/clients/[id]/edit/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import { use } from "react"
import dynamic from "next/dynamic"

const EditClientPage = dynamic(
  () => import("@/modules/clients").then((mod) => mod.EditClientPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditClientPageRoute({ params }: PageProps) {
  const { id } = use(params)
  return <EditClientPage clientId={id} />
}
