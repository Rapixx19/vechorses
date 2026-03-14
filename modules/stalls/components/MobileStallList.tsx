/**
 * FILE: modules/stalls/components/MobileStallList.tsx
 * ZONE: Green
 * PURPOSE: Simplified list view of stalls for mobile devices
 * EXPORTS: MobileStallList
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: StallGrid
 * TESTS: modules/stalls/tests/MobileStallList.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for floor plan builder
 */

"use client"

import { Home, ChevronRight } from "lucide-react"
import type { Stall, Horse } from "@/lib/types"

interface MobileStallListProps {
  stalls: Stall[]
  horses: Horse[]
  onStallClick: (stall: Stall) => void
}

export function MobileStallList({ stalls, horses, onStallClick }: MobileStallListProps) {
  const getHorse = (horseId: string | null): Horse | null => {
    if (!horseId) return null
    return horses.find((h) => h.id === horseId) || null
  }

  const occupiedStalls = stalls.filter((s) => s.horseId)
  const vacantStalls = stalls.filter((s) => !s.horseId && !s.isMaintenance)
  const maintenanceStalls = stalls.filter((s) => s.isMaintenance)

  return (
    <div className="space-y-6">
      {/* Occupied Stalls */}
      {occupiedStalls.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Occupied ({occupiedStalls.length})
          </h3>
          <div className="space-y-2">
            {occupiedStalls.map((stall) => {
              const horse = getHorse(stall.horseId)
              return (
                <button
                  key={stall.id}
                  onClick={() => onStallClick(stall)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-900/20 border border-green-600 hover:bg-green-900/30 transition-colors"
                >
                  <div className="p-2 rounded-full bg-green-600/20">
                    <Home className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white">{horse?.name || "Unknown"}</div>
                    <div className="text-sm text-gray-400">{stall.label}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Vacant Stalls */}
      {vacantStalls.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Vacant ({vacantStalls.length})
          </h3>
          <div className="space-y-2">
            {vacantStalls.map((stall) => (
              <button
                key={stall.id}
                onClick={() => onStallClick(stall)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#1A1A2E] border border-[#2a2a3e] hover:bg-[#252538] transition-colors"
              >
                <div className="p-2 rounded-full bg-gray-700">
                  <Home className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-300">{stall.label}</div>
                  <div className="text-sm text-gray-500">Available</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Stalls */}
      {maintenanceStalls.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Maintenance ({maintenanceStalls.length})
          </h3>
          <div className="space-y-2">
            {maintenanceStalls.map((stall) => (
              <button
                key={stall.id}
                onClick={() => onStallClick(stall)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-yellow-900/10 border border-yellow-600/50 hover:bg-yellow-900/20 transition-colors"
              >
                <div className="p-2 rounded-full bg-yellow-600/20">
                  <Home className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-yellow-300">{stall.label}</div>
                  <div className="text-sm text-yellow-500">Under maintenance</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {stalls.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No stalls configured yet
        </div>
      )}
    </div>
  )
}
