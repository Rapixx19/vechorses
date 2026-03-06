/**
 * FILE: modules/stalls/components/StallCell.tsx
 * ZONE: Green
 * PURPOSE: Individual stall cell showing occupied or empty state with task badge
 * EXPORTS: StallCell
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: StallGrid
 * TESTS: modules/stalls/tests/StallCell.test.tsx
 * LAST CHANGED: 2026-03-06 — Added pendingTaskCount badge
 */

import { Plus } from "lucide-react"
import type { Stall, Horse } from "@/lib/types"

interface StallCellProps {
  stall: Stall
  horse: Horse | null
  pendingTaskCount: number
  ownerName?: string
  onClick: () => void
}

export function StallCell({ stall, horse, pendingTaskCount, ownerName, onClick }: StallCellProps) {
  const stallNumber = stall.label.split(" - ")[1] || stall.label

  if (horse) {
    return (
      <button
        onClick={onClick}
        className="relative w-full p-3 rounded-lg text-left transition-colors hover:bg-green-900/30"
        style={{ backgroundColor: "rgba(44, 95, 46, 0.15)" }}
      >
        <span className="text-[10px] text-[var(--text-muted)]">{stallNumber}</span>
        {pendingTaskCount > 0 && (
          <span className="absolute top-2 right-2 min-w-[18px] h-[18px] rounded-full bg-amber-500 text-[10px] font-medium text-black flex items-center justify-center px-1">
            {pendingTaskCount}
          </span>
        )}
        <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{horse.name}</p>
        <p className="text-xs text-[var(--text-muted)] truncate">{horse.breed} • {horse.color}</p>
        {ownerName && <p className="text-[10px] text-[var(--text-muted)] mt-1 truncate">{ownerName}</p>}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg border-2 border-dashed border-[var(--border)] text-center transition-colors hover:border-[#2C5F2E]/50 hover:bg-[#1A1A2E]"
    >
      <span className="text-[10px] text-[var(--text-muted)] block text-left">{stallNumber}</span>
      <div className="flex flex-col items-center py-2">
        <Plus className="h-5 w-5 text-[var(--text-muted)]" />
        <span className="text-xs text-[var(--text-muted)] mt-1">Empty</span>
      </div>
    </button>
  )
}
