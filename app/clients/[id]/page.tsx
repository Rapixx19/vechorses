/**
 * FILE: app/clients/[id]/page.tsx
 * ZONE: Green
 * PURPOSE: Individual client detail page
 * EXPORTS: default (ClientDetailPage)
 * DEPENDS ON: modules/clients
 * CONSUMED BY: Next.js routing
 * TESTS: app/clients/[id]/page.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

import { ClientDetail } from "@/modules/clients"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div>
      <ClientDetail clientId={id} />
    </div>
  )
}
