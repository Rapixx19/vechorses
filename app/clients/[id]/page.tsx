/**
 * FILE: app/clients/[id]/page.tsx
 * ZONE: Green
 * PURPOSE: Individual client detail page with SSR disabled
 * EXPORTS: default (ClientDetailPage)
 * DEPENDS ON: modules/clients
 * CONSUMED BY: Next.js routing
 * TESTS: app/clients/[id]/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import { use } from "react"
import dynamic from "next/dynamic"

const ClientDetail = dynamic(
  () => import("@/modules/clients").then((mod) => mod.ClientDetail),
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

export default function ClientDetailPage({ params }: PageProps) {
  const { id } = use(params)

  return (
    <div>
      <ClientDetail clientId={id} />
    </div>
  )
}
