/**
 * FILE: modules/stalls/components/FloorPlanView.tsx
 * ZONE: Green
 * PURPOSE: Read-only view of the stable floor plan for normal browsing
 * EXPORTS: FloorPlanView
 * DEPENDS ON: GridCell, lib/types.ts
 * CONSUMED BY: StallGrid
 * TESTS: modules/stalls/tests/FloorPlanView.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for floor plan builder
 */

"use client"

import { useCallback } from "react"
import { GridCell } from "./GridCell"
import type { StableLayout, Stall, Horse } from "@/lib/types"

interface FloorPlanViewProps {
  layout: StableLayout
  stalls: Stall[]
  horses: Horse[]
  onStallClick: (stallId: string) => void
}

export function FloorPlanView({ layout, stalls, horses, onStallClick }: FloorPlanViewProps) {
  // BREADCRUMB: Find cell at position
  const getCellAt = useCallback((row: number, col: number) => {
    return layout.cells.find((c) => c.row === row && c.col === col)
  }, [layout.cells])

  // BREADCRUMB: Get horse for a stall
  const getHorseForStall = useCallback((stallId?: string): Horse | null => {
    if (!stallId) return null
    const stall = stalls.find((s) => s.id === stallId)
    if (!stall?.horseId) return null
    return horses.find((h) => h.id === stall.horseId) || null
  }, [stalls, horses])

  // BREADCRUMB: Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    const cell = getCellAt(row, col)
    if (cell?.type === "stall" && cell.stallId) {
      onStallClick(cell.stallId)
    }
  }, [getCellAt, onStallClick])

  if (layout.cells.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)] mb-2">No stalls configured yet</p>
        <p className="text-sm text-gray-500">Click &quot;Edit Layout&quot; to design your stable floor plan</p>
      </div>
    )
  }

  return (
    <div className="overflow-auto">
      <div
        className="grid gap-1 p-4 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${layout.cols}, minmax(60px, 1fr))`,
          backgroundColor: "#0F1117",
        }}
      >
        {Array.from({ length: layout.rows * layout.cols }).map((_, idx) => {
          const row = Math.floor(idx / layout.cols)
          const col = idx % layout.cols
          const cell = getCellAt(row, col)

          return (
            <GridCell
              key={`${row}-${col}`}
              type={cell?.type || "empty"}
              stallType={cell?.stallType}
              label={cell?.label}
              horse={getHorseForStall(cell?.stallId)}
              isEditMode={false}
              onCellClick={() => handleCellClick(row, col)}
            />
          )
        })}
      </div>
    </div>
  )
}
