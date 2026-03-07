/**
 * FILE: modules/stalls/components/GridControls.tsx
 * ZONE: Green
 * PURPOSE: Controls for adjusting grid rows/cols in floor plan editor
 * EXPORTS: GridControls
 * DEPENDS ON: lucide-react
 * CONSUMED BY: FloorPlanCanvas
 * TESTS: modules/stalls/tests/GridControls.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for floor plan builder
 */

"use client"

import { Minus, Plus } from "lucide-react"

interface GridControlsProps {
  rows: number
  cols: number
  onRowsChange: (rows: number) => void
  onColsChange: (cols: number) => void
  onSave: () => void
  onCancel: () => void
  isSaving?: boolean
}

// BREADCRUMB: Grid dimension limits
const MIN_ROWS = 4
const MAX_ROWS = 20
const MIN_COLS = 4
const MAX_COLS = 15

export function GridControls({
  rows,
  cols,
  onRowsChange,
  onColsChange,
  onSave,
  onCancel,
  isSaving,
}: GridControlsProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "#1A1A2E" }}>
      <div className="flex items-center gap-6">
        {/* Rows Control */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Rows:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onRowsChange(Math.max(MIN_ROWS, rows - 1))}
              disabled={rows <= MIN_ROWS}
              className="p-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="h-3 w-3 text-white" />
            </button>
            <span className="w-8 text-center text-white font-medium">{rows}</span>
            <button
              onClick={() => onRowsChange(Math.min(MAX_ROWS, rows + 1))}
              disabled={rows >= MAX_ROWS}
              className="p-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-3 w-3 text-white" />
            </button>
          </div>
        </div>

        {/* Cols Control */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Cols:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onColsChange(Math.max(MIN_COLS, cols - 1))}
              disabled={cols <= MIN_COLS}
              className="p-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="h-3 w-3 text-white" />
            </button>
            <span className="w-8 text-center text-white font-medium">{cols}</span>
            <button
              onClick={() => onColsChange(Math.min(MAX_COLS, cols + 1))}
              disabled={cols >= MAX_COLS}
              className="p-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-3 w-3 text-white" />
            </button>
          </div>
        </div>

        <span className="text-sm text-gray-500">
          {rows} x {cols} = {rows * cols} cells
        </span>
      </div>

      {/* Save/Cancel */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-white hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: "#2C5F2E" }}
        >
          {isSaving ? "Saving..." : "Save Layout"}
        </button>
      </div>
    </div>
  )
}
