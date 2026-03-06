/**
 * FILE: modules/stalls/components/StallSummary.tsx
 * ZONE: Green
 * PURPOSE: Summary stats row showing stall occupancy
 * EXPORTS: StallSummary
 * DEPENDS ON: useStalls
 * CONSUMED BY: app/stalls/page.tsx
 * TESTS: modules/stalls/tests/StallSummary.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

"use client"

import { useStalls } from "@/modules/stalls"

export function StallSummary() {
  const stalls = useStalls()
  const total = stalls.length
  const occupied = stalls.filter((s) => s.horseId).length
  const empty = total - occupied
  const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Total Stalls" value={String(total)} />
      <StatCard label="Occupied" value={String(occupied)} />
      <StatCard label="Empty" value={String(empty)} />
      <StatCard label="Occupancy" value={`${percentage}%`} />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-xl font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  )
}
