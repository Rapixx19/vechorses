/**
 * FILE: app/horses/[id]/page.tsx
 * ZONE: Green
 * PURPOSE: Individual horse detail page
 * EXPORTS: default (HorseDetailPage)
 * DEPENDS ON: modules/horses
 * CONSUMED BY: Next.js routing
 * TESTS: app/horses/[id]/page.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

import { HorseDetail } from "@/modules/horses"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function HorseDetailPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div>
      <HorseDetail horseId={id} />
    </div>
  )
}
