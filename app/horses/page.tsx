/**
 * FILE: app/horses/page.tsx
 * ZONE: Green
 * PURPOSE: List all horses page
 * EXPORTS: default (HorsesPage)
 * DEPENDS ON: modules/horses
 * CONSUMED BY: Next.js routing
 * TESTS: app/horses/page.test.tsx
 * LAST CHANGED: 2026-03-06 — Added HorseList component
 */

import { HorseList } from "@/modules/horses"

export default function HorsesPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Horses</h2>
      <HorseList />
    </div>
  )
}
