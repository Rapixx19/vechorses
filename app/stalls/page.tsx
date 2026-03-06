/**
 * FILE: app/stalls/page.tsx
 * ZONE: Green
 * PURPOSE: Visual stall grid and occupancy management page
 * EXPORTS: default (StallsPage)
 * DEPENDS ON: modules/stalls
 * CONSUMED BY: Next.js routing
 * TESTS: app/stalls/page.test.tsx
 * LAST CHANGED: 2026-03-06 — Added StallSummary and StallGrid
 */

import { StallSummary, StallGrid } from "@/modules/stalls"

export default function StallsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Stalls</h2>
      <StallSummary />
      <StallGrid />
    </div>
  )
}
