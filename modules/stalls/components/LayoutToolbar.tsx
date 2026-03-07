/**
 * FILE: modules/stalls/components/LayoutToolbar.tsx
 * ZONE: Green
 * PURPOSE: Left sidebar toolbar with placeable items for floor plan editor
 * EXPORTS: LayoutToolbar, ToolType
 * DEPENDS ON: lucide-react
 * CONSUMED BY: FloorPlanCanvas
 * TESTS: modules/stalls/tests/LayoutToolbar.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for floor plan builder
 */

"use client"

import { Home, Square, Minus, DoorOpen, Eraser } from "lucide-react"

export type ToolType = "stall-standard" | "stall-large" | "stall-paddock" | "wall" | "aisle" | "door" | "eraser"

interface LayoutToolbarProps {
  selectedTool: ToolType
  onSelectTool: (tool: ToolType) => void
}

// BREADCRUMB: Tool definitions with icons and labels
const TOOLS: { type: ToolType; icon: React.ReactNode; label: string; color: string }[] = [
  { type: "stall-standard", icon: <Home className="h-4 w-4" />, label: "Standard Stall", color: "bg-green-600" },
  { type: "stall-large", icon: <Home className="h-4 w-4" />, label: "Large Box", color: "bg-blue-600" },
  { type: "stall-paddock", icon: <Home className="h-4 w-4" />, label: "Paddock", color: "bg-amber-600" },
  { type: "wall", icon: <Square className="h-4 w-4" />, label: "Wall", color: "bg-gray-800" },
  { type: "aisle", icon: <Minus className="h-4 w-4" />, label: "Aisle", color: "bg-gray-600" },
  { type: "door", icon: <DoorOpen className="h-4 w-4" />, label: "Door", color: "bg-amber-700" },
  { type: "eraser", icon: <Eraser className="h-4 w-4" />, label: "Eraser", color: "bg-red-600" },
]

export function LayoutToolbar({ selectedTool, onSelectTool }: LayoutToolbarProps) {
  return (
    <div className="w-40 flex-shrink-0 rounded-lg p-3 space-y-2" style={{ backgroundColor: "#1A1A2E" }}>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tools</h3>
      {TOOLS.map((tool) => (
        <button
          key={tool.type}
          onClick={() => onSelectTool(tool.type)}
          className={`
            w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
            ${selectedTool === tool.type
              ? "bg-green-600/20 text-green-400 ring-1 ring-green-500"
              : "text-gray-300 hover:bg-gray-700/50"
            }
          `}
        >
          <span className={`p-1 rounded ${tool.color}`}>{tool.icon}</span>
          <span className="truncate">{tool.label}</span>
        </button>
      ))}
    </div>
  )
}
