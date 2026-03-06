/**
 * FILE: modules/stalls/components/AssignHorseSheet.tsx
 * ZONE: Green
 * PURPOSE: Sheet for assigning a horse to an empty stall
 * EXPORTS: AssignHorseSheet
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: StallGrid
 * TESTS: modules/stalls/tests/AssignHorseSheet.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

"use client"

import { X } from "lucide-react"
import type { Stall, Horse, Client } from "@/lib/types"

interface AssignHorseSheetProps {
  stall: Stall
  unassignedHorses: Horse[]
  clients: Client[]
  onAssign: (horseId: string) => void
  onClose: () => void
}

export function AssignHorseSheet({ stall, unassignedHorses, clients, onAssign, onClose }: AssignHorseSheetProps) {
  const getOwnerName = (ownerId: string) => clients.find((c) => c.id === ownerId)?.fullName || "Unknown"

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-80 h-full bg-[#0F1117] border-l border-[var(--border)] p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-1">Assign Horse</h3>
        <p className="text-xs text-[var(--text-muted)] mb-6">{stall.label}</p>

        {unassignedHorses.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-8">
            All horses are currently assigned to a stall
          </p>
        ) : (
          <div className="space-y-2">
            {unassignedHorses.map((horse) => (
              <button
                key={horse.id}
                onClick={() => onAssign(horse.id)}
                className="w-full p-3 rounded-lg text-left bg-[#1A1A2E] hover:bg-[#252538] transition-colors"
              >
                <p className="font-medium text-sm text-[var(--text-primary)]">{horse.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{horse.breed}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{getOwnerName(horse.ownerId)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
