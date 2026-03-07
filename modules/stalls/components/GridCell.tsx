/**
 * FILE: modules/stalls/components/GridCell.tsx
 * ZONE: Green
 * PURPOSE: Renders a single cell in the floor plan grid based on cell type
 * EXPORTS: GridCell
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: FloorPlanCanvas
 * TESTS: modules/stalls/tests/GridCell.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for floor plan builder
 */

"use client"

import { Home, DoorOpen, Plus, GripVertical, X } from "lucide-react"
import type { CellType, StallType, Horse } from "@/lib/types"

interface GridCellProps {
  type: CellType
  stallType?: StallType
  label?: string
  horse?: Horse | null
  isEditMode: boolean
  isSelected?: boolean
  onCellClick: () => void
  onDelete?: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

// BREADCRUMB: Type badge mapping for stall types
const TYPE_BADGES: Record<StallType, { label: string; bg: string }> = {
  standard: { label: "Std", bg: "bg-gray-600" },
  large: { label: "Lrg", bg: "bg-blue-600" },
  paddock: { label: "Pad", bg: "bg-amber-600" },
}

export function GridCell({
  type,
  stallType = "standard",
  label,
  horse,
  isEditMode,
  isSelected,
  onCellClick,
  onDelete,
  onDragStart,
  onDragEnd,
}: GridCellProps) {
  // BREADCRUMB: Empty cell rendering
  if (type === "empty") {
    return (
      <button
        onClick={onCellClick}
        className={`
          aspect-square rounded border-2 border-dashed transition-all
          ${isEditMode
            ? "border-gray-700 hover:border-green-600/50 hover:bg-green-900/10 cursor-pointer"
            : "border-transparent cursor-default"
          }
          bg-[#0F1117] flex items-center justify-center
        `}
      >
        {isEditMode && <Plus className="h-5 w-5 text-gray-600" />}
      </button>
    )
  }

  // BREADCRUMB: Wall cell rendering
  if (type === "wall") {
    return (
      <div
        onClick={isEditMode ? onCellClick : undefined}
        className={`
          aspect-square rounded bg-[#1a1a1a] border-2 border-[#1a1a1a]
          ${isEditMode ? "cursor-pointer relative group" : ""}
          ${isSelected ? "ring-2 ring-green-500" : ""}
        `}
      >
        {isEditMode && onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="absolute top-1 right-1 p-0.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }

  // BREADCRUMB: Aisle cell rendering
  if (type === "aisle") {
    return (
      <div
        onClick={isEditMode ? onCellClick : undefined}
        className={`
          aspect-square rounded bg-[#1A1A2E]/50 border border-dashed border-gray-700/30
          ${isEditMode ? "cursor-pointer relative group" : ""}
          ${isSelected ? "ring-2 ring-green-500" : ""}
        `}
        style={{
          backgroundImage: "radial-gradient(circle, #2a2a3e 1px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
      >
        {isEditMode && onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="absolute top-1 right-1 p-0.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }

  // BREADCRUMB: Door cell rendering
  if (type === "door") {
    return (
      <div
        onClick={isEditMode ? onCellClick : undefined}
        className={`
          aspect-square rounded bg-[#1A1A2E] border-2 border-amber-600/50
          flex items-center justify-center
          ${isEditMode ? "cursor-pointer relative group" : ""}
          ${isSelected ? "ring-2 ring-green-500" : ""}
        `}
      >
        <DoorOpen className="h-6 w-6 text-amber-500" />
        {isEditMode && onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="absolute top-1 right-1 p-0.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }

  // BREADCRUMB: Stall cell rendering (most complex)
  const isOccupied = !!horse
  const badge = TYPE_BADGES[stallType]

  return (
    <div
      draggable={isEditMode}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onCellClick}
      className={`
        aspect-square rounded-lg p-1.5 flex flex-col transition-all cursor-pointer relative group
        ${isOccupied
          ? "bg-green-900/20 border-2 border-green-600"
          : "bg-[#1A1A2E] border-2 border-gray-600"
        }
        ${isSelected ? "ring-2 ring-green-500" : ""}
        ${isEditMode ? "hover:ring-2 hover:ring-green-500/50" : "hover:border-green-500"}
      `}
    >
      {/* Edit mode controls */}
      {isEditMode && (
        <>
          <div className="absolute top-0.5 left-0.5 p-0.5 text-gray-500 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-3 w-3" />
          </div>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="absolute top-0.5 right-0.5 p-0.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </>
      )}

      {/* Type badge */}
      <span className={`absolute top-0.5 right-0.5 text-[8px] px-1 rounded ${badge.bg} text-white ${isEditMode ? "opacity-0 group-hover:opacity-0" : ""}`}>
        {badge.label}
      </span>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <Home className={`h-4 w-4 mb-0.5 ${isOccupied ? "text-green-400" : "text-gray-500"}`} />
        <span className={`text-[10px] font-medium text-center truncate w-full ${isOccupied ? "text-green-400" : "text-gray-400"}`}>
          {isOccupied ? horse.name : label || "Empty"}
        </span>
        {!isOccupied && label && (
          <span className="text-[8px] text-gray-500 truncate w-full text-center">{label}</span>
        )}
      </div>
    </div>
  )
}
