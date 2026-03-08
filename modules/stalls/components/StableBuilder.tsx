/**
 * FILE: modules/stalls/components/StableBuilder.tsx
 * ZONE: Green
 * PURPOSE: Edit mode interface for arranging stalls in a visual grid
 * EXPORTS: StableBuilder
 * DEPENDS ON: lib/types.ts, lucide-react, useAddStall, useUpdateStall, useDeleteStall
 * CONSUMED BY: StallGrid
 * TESTS: modules/stalls/tests/StableBuilder.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for visual stable builder
 */

"use client"

import { useState } from "react"
import { Plus, GripVertical, Trash2 } from "lucide-react"
import type { Stall, StallType } from "@/lib/types"

interface StableBuilderProps {
  stalls: Stall[]
  gridCols: number
  onGridColsChange: (cols: number) => void
  onAddStall: (position: number, rowIndex: number, colIndex: number) => void
  onUpdateStall: (id: string, updates: Partial<Stall>) => void
  onDeleteStall: (id: string) => void
  onSave: () => void
  onCancel: () => void
}

const STALL_TYPES: { value: StallType; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "large", label: "Large" },
  { value: "paddock", label: "Paddock" },
]

export function StableBuilder({
  stalls,
  gridCols,
  onGridColsChange,
  onAddStall,
  onUpdateStall,
  onDeleteStall,
  onSave,
  onCancel,
}: StableBuilderProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [draggedId, setDraggedId] = useState<string | null>(null)

  // Calculate grid dimensions
  const totalSlots = Math.max(stalls.length + 4, gridCols * Math.ceil((stalls.length + 4) / gridCols))
  const rows = Math.ceil(totalSlots / gridCols)

  // Create slot map
  const slotMap = new Map<string, Stall>()
  stalls.forEach((stall) => {
    const key = `${stall.rowIndex}-${stall.colIndex}`
    slotMap.set(key, stall)
  })

  const handleStartEdit = (stall: Stall) => {
    setEditingId(stall.id)
    setEditLabel(stall.label)
  }

  const handleSaveEdit = () => {
    if (editingId && editLabel.trim()) {
      onUpdateStall(editingId, { label: editLabel.trim() })
    }
    setEditingId(null)
    setEditLabel("")
  }

  const handleDragStart = (stallId: string) => {
    setDraggedId(stallId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (rowIndex: number, colIndex: number) => {
    if (draggedId) {
      const position = rowIndex * gridCols + colIndex
      onUpdateStall(draggedId, { rowIndex, colIndex, position })
      setDraggedId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Grid Controls */}
      <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: "#1A1A2E" }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Columns:</label>
            <input
              type="number"
              min={2}
              max={8}
              value={gridCols}
              onChange={(e) => onGridColsChange(Math.max(2, Math.min(8, parseInt(e.target.value) || 4)))}
              className="w-16 px-2 py-1 rounded bg-[#252538] border border-gray-600 text-white text-sm"
            />
          </div>
          <span className="text-sm text-gray-400">{stalls.length} stalls</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-white hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-md text-sm font-medium text-white"
            style={{ backgroundColor: "#2C5F2E" }}
          >
            Save Layout
          </button>
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows * gridCols }).map((_, idx) => {
          const rowIndex = Math.floor(idx / gridCols)
          const colIndex = idx % gridCols
          const key = `${rowIndex}-${colIndex}`
          const stall = slotMap.get(key)

          if (stall) {
            const isEditing = editingId === stall.id

            return (
              <div
                key={stall.id}
                draggable
                onDragStart={() => handleDragStart(stall.id)}
                onDragOver={(e) => handleDragOver(e)}
                onDrop={() => handleDrop(rowIndex, colIndex)}
                className={`relative aspect-square p-2 rounded-lg border-2 ${
                  stall.horseId ? "border-green-600 bg-green-900/15" : "border-gray-600 bg-[#1A1A2E]"
                } ${draggedId === stall.id ? "opacity-50" : ""}`}
              >
                {/* Drag Handle */}
                <div className="absolute top-1 left-1 p-1 text-gray-500 cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-3 w-3" />
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => onDeleteStall(stall.id)}
                  className="absolute top-1 right-1 p-1 text-gray-500 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>

                {/* Content */}
                <div className="flex flex-col items-center justify-center h-full pt-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                      autoFocus
                      className="w-full px-1 py-0.5 rounded bg-[#252538] border border-gray-500 text-white text-xs text-center"
                    />
                  ) : (
                    <button
                      onClick={() => handleStartEdit(stall)}
                      className="text-xs font-medium text-white hover:text-green-400"
                    >
                      {stall.label}
                    </button>
                  )}

                  {/* Type Selector */}
                  <select
                    value={stall.type}
                    onChange={(e) => onUpdateStall(stall.id, { type: e.target.value as StallType })}
                    className="mt-2 w-full px-1 py-0.5 rounded bg-[#252538] border border-gray-600 text-gray-400 text-[10px]"
                  >
                    {STALL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>

                  {/* Maintenance Toggle */}
                  <button
                    onClick={() => onUpdateStall(stall.id, { isMaintenance: !stall.isMaintenance })}
                    className={`mt-1 text-[9px] px-1.5 py-0.5 rounded ${
                      stall.isMaintenance ? "bg-yellow-600/30 text-yellow-400" : "bg-gray-700 text-gray-500"
                    }`}
                  >
                    {stall.isMaintenance ? "Maintenance" : "Active"}
                  </button>
                </div>
              </div>
            )
          }

          // Empty slot - can add new stall
          return (
            <button
              key={`empty-${idx}`}
              onDragOver={(e) => handleDragOver(e)}
              onDrop={() => handleDrop(rowIndex, colIndex)}
              onClick={() => onAddStall(idx, rowIndex, colIndex)}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-700 bg-[#0F1117] flex items-center justify-center hover:border-green-600/50 hover:bg-green-900/10 transition-colors"
            >
              <Plus className="h-6 w-6 text-gray-600" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
