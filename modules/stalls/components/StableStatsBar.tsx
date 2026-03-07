/**
 * FILE: modules/stalls/components/StableStatsBar.tsx
 * ZONE: Green
 * PURPOSE: Stats bar showing total stalls, occupancy rate, and breakdown
 * EXPORTS: StableStatsBar
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: StallGrid
 * TESTS: modules/stalls/tests/StableStatsBar.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for visual stable builder
 */

import type { Stall } from "@/lib/types"

interface StableStatsBarProps {
  stalls: Stall[]
}

export function StableStatsBar({ stalls }: StableStatsBarProps) {
  const total = stalls.length
  const occupied = stalls.filter((s) => s.horseId !== null).length
  const vacant = stalls.filter((s) => s.horseId === null && !s.isMaintenance).length
  const maintenance = stalls.filter((s) => s.isMaintenance).length
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">Stable Overview</h3>
        <span className="text-2xl font-bold text-[var(--text-primary)]">{total} stalls</span>
      </div>

      {/* Occupancy Bar */}
      <div className="h-3 rounded-full bg-gray-700 overflow-hidden mb-3">
        <div
          className="h-full bg-green-600 transition-all duration-300"
          style={{ width: `${occupancyRate}%` }}
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600" />
          <span className="text-gray-400">Occupied</span>
          <span className="font-medium text-white">{occupied}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-600" />
          <span className="text-gray-400">Vacant</span>
          <span className="font-medium text-white">{vacant}</span>
        </div>
        {maintenance > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-600" />
            <span className="text-gray-400">Maintenance</span>
            <span className="font-medium text-white">{maintenance}</span>
          </div>
        )}
        <div className="ml-auto text-gray-400">
          <span className="font-medium text-white">{occupancyRate}%</span> occupancy
        </div>
      </div>
    </div>
  )
}
