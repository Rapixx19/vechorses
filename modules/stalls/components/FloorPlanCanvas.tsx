/**
 * FILE: modules/stalls/components/FloorPlanCanvas.tsx
 * ZONE: Green
 * PURPOSE: Main canvas component for floor plan editing with drag and drop
 * EXPORTS: FloorPlanCanvas
 * DEPENDS ON: GridCell, LayoutToolbar, GridControls, lib/types.ts
 * CONSUMED BY: StallGrid
 * TESTS: modules/stalls/tests/FloorPlanCanvas.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for floor plan builder
 */

"use client"

import { useState, useCallback } from "react"
import { GridCell } from "./GridCell"
import { LayoutToolbar, type ToolType } from "./LayoutToolbar"
import { GridControls } from "./GridControls"
import type { StableLayout, LayoutCell, Stall, Horse, CellType, StallType } from "@/lib/types"

interface FloorPlanCanvasProps {
  layout: StableLayout
  stalls: Stall[]
  horses: Horse[]
  onLayoutChange: (layout: StableLayout) => void
  onSave: () => void
  onCancel: () => void
  onStallClick: (stallId: string) => void
  isSaving?: boolean
}

// BREADCRUMB: Map tool type to cell/stall type
function toolToCellType(tool: ToolType): { cellType: CellType; stallType?: StallType } {
  switch (tool) {
    case "stall-standard": return { cellType: "stall", stallType: "standard" }
    case "stall-large": return { cellType: "stall", stallType: "large" }
    case "stall-paddock": return { cellType: "stall", stallType: "paddock" }
    case "wall": return { cellType: "wall" }
    case "aisle": return { cellType: "aisle" }
    case "door": return { cellType: "door" }
    case "eraser": return { cellType: "empty" }
  }
}

export function FloorPlanCanvas({
  layout,
  stalls,
  horses,
  onLayoutChange,
  onSave,
  onCancel,
  isSaving,
}: FloorPlanCanvasProps) {
  const [selectedTool, setSelectedTool] = useState<ToolType>("stall-standard")
  const [draggedCell, setDraggedCell] = useState<{ row: number; col: number } | null>(null)
  const [stallCounter, setStallCounter] = useState(stalls.length + 1)

  // BREADCRUMB: Find cell at position
  const getCellAt = useCallback((row: number, col: number): LayoutCell | undefined => {
    return layout.cells.find((c) => c.row === row && c.col === col)
  }, [layout.cells])

  // BREADCRUMB: Get horse for a stall
  const getHorseForStall = useCallback((stallId?: string): Horse | null => {
    if (!stallId) return null
    const stall = stalls.find((s) => s.id === stallId)
    if (!stall?.horseId) return null
    return horses.find((h) => h.id === stall.horseId) || null
  }, [stalls, horses])

  // BREADCRUMB: Handle cell click in edit mode
  const handleCellClick = useCallback((row: number, col: number) => {
    const existingCell = getCellAt(row, col)
    const { cellType, stallType } = toolToCellType(selectedTool)

    // Handle eraser
    if (selectedTool === "eraser") {
      if (existingCell) {
        const newCells = layout.cells.filter((c) => !(c.row === row && c.col === col))
        onLayoutChange({ ...layout, cells: newCells })
      }
      return
    }

    // Handle placing new cell
    if (existingCell && existingCell.type !== "empty") {
      // Replace existing cell
      const newCells = layout.cells.map((c) =>
        c.row === row && c.col === col
          ? { ...c, type: cellType, stallType, label: cellType === "stall" ? `Box ${stallCounter}` : undefined }
          : c
      )
      onLayoutChange({ ...layout, cells: newCells })
      if (cellType === "stall") setStallCounter((n) => n + 1)
    } else {
      // Add new cell
      const newCell: LayoutCell = {
        row,
        col,
        type: cellType,
        stallType,
        label: cellType === "stall" ? `Box ${stallCounter}` : undefined,
        width: 1,
        height: 1,
      }
      onLayoutChange({ ...layout, cells: [...layout.cells, newCell] })
      if (cellType === "stall") setStallCounter((n) => n + 1)
    }
  }, [layout, selectedTool, getCellAt, onLayoutChange, stallCounter])

  // BREADCRUMB: Handle delete cell
  const handleDeleteCell = useCallback((row: number, col: number) => {
    const newCells = layout.cells.filter((c) => !(c.row === row && c.col === col))
    onLayoutChange({ ...layout, cells: newCells })
  }, [layout, onLayoutChange])

  // BREADCRUMB: Handle drag start
  const handleDragStart = useCallback((row: number, col: number) => {
    setDraggedCell({ row, col })
  }, [])

  // BREADCRUMB: Handle drop
  const handleDrop = useCallback((targetRow: number, targetCol: number) => {
    if (!draggedCell) return

    const cell = getCellAt(draggedCell.row, draggedCell.col)
    if (!cell) return

    // Check if target is occupied
    const targetCell = getCellAt(targetRow, targetCol)
    if (targetCell && targetCell.type !== "empty") return

    // Move cell to new position
    const newCells = layout.cells.map((c) =>
      c.row === draggedCell.row && c.col === draggedCell.col
        ? { ...c, row: targetRow, col: targetCol }
        : c
    )
    onLayoutChange({ ...layout, cells: newCells })
    setDraggedCell(null)
  }, [draggedCell, layout, getCellAt, onLayoutChange])

  // BREADCRUMB: Handle grid resize
  const handleRowsChange = useCallback((newRows: number) => {
    // Check if any cells would be cut off
    const maxRow = Math.max(...layout.cells.map((c) => c.row), -1)
    if (newRows <= maxRow) {
      if (!confirm("Shrinking will remove items outside the new grid. Continue?")) return
      const newCells = layout.cells.filter((c) => c.row < newRows)
      onLayoutChange({ ...layout, rows: newRows, cells: newCells })
    } else {
      onLayoutChange({ ...layout, rows: newRows })
    }
  }, [layout, onLayoutChange])

  const handleColsChange = useCallback((newCols: number) => {
    const maxCol = Math.max(...layout.cells.map((c) => c.col), -1)
    if (newCols <= maxCol) {
      if (!confirm("Shrinking will remove items outside the new grid. Continue?")) return
      const newCells = layout.cells.filter((c) => c.col < newCols)
      onLayoutChange({ ...layout, cols: newCols, cells: newCells })
    } else {
      onLayoutChange({ ...layout, cols: newCols })
    }
  }, [layout, onLayoutChange])

  return (
    <div className="space-y-4">
      {/* Grid Controls */}
      <GridControls
        rows={layout.rows}
        cols={layout.cols}
        onRowsChange={handleRowsChange}
        onColsChange={handleColsChange}
        onSave={onSave}
        onCancel={onCancel}
        isSaving={isSaving}
      />

      {/* Canvas Area */}
      <div className="flex gap-4">
        {/* Toolbar */}
        <LayoutToolbar selectedTool={selectedTool} onSelectTool={setSelectedTool} />

        {/* Grid */}
        <div className="flex-1 overflow-auto">
          <div
            className="grid gap-1 p-4 rounded-lg"
            style={{
              gridTemplateColumns: `repeat(${layout.cols}, minmax(60px, 1fr))`,
              backgroundColor: "#0F1117",
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {Array.from({ length: layout.rows * layout.cols }).map((_, idx) => {
              const row = Math.floor(idx / layout.cols)
              const col = idx % layout.cols
              const cell = getCellAt(row, col)

              return (
                <div
                  key={`${row}-${col}`}
                  onDrop={() => handleDrop(row, col)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <GridCell
                    type={cell?.type || "empty"}
                    stallType={cell?.stallType}
                    label={cell?.label}
                    horse={getHorseForStall(cell?.stallId)}
                    isEditMode={true}
                    isSelected={draggedCell?.row === row && draggedCell?.col === col}
                    onCellClick={() => handleCellClick(row, col)}
                    onDelete={cell && cell.type !== "empty" ? () => handleDeleteCell(row, col) : undefined}
                    onDragStart={cell?.type === "stall" ? () => handleDragStart(row, col) : undefined}
                    onDragEnd={() => setDraggedCell(null)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
