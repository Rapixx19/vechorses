/**
 * FILE: app/clients/page.tsx
 * ZONE: Green
 * PURPOSE: List all clients page
 * EXPORTS: default (ClientsPage)
 * DEPENDS ON: modules/clients
 * CONSUMED BY: Next.js routing
 * TESTS: app/clients/page.test.tsx
 * LAST CHANGED: 2026-03-06 — Added ClientList component
 */

import { ClientList } from "@/modules/clients"

export default function ClientsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Clients</h2>
      <ClientList />
    </div>
  )
}
