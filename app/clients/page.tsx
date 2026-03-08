/**
 * FILE: app/clients/page.tsx
 * ZONE: Green
 * PURPOSE: List all clients page with SSR disabled
 * EXPORTS: default (ClientsPage)
 * DEPENDS ON: modules/clients
 * CONSUMED BY: Next.js routing
 * TESTS: app/clients/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import dynamic from "next/dynamic"

const ClientList = dynamic(
  () => import("@/modules/clients").then((mod) => mod.ClientList),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function ClientsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Clients</h2>
      <ClientList />
    </div>
  )
}
