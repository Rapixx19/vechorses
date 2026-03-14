/**
 * FILE: modules/stalls/components/StallCard.tsx
 * ZONE: Green
 * PURPOSE: Visual square stall card showing occupancy, horse info, and type
 * EXPORTS: StallCard
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: StallGrid
 * TESTS: modules/stalls/tests/StallCard.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for visual stable builder
 */

import { Home, Lock, AlertTriangle, GripVertical } from "lucide-react"
import type { Stall, Horse, StallType } from "@/lib/types"

interface StallCardProps {
  stall: Stall
  horse: Horse | null
  isEditMode?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  onClick: () => void
}

const typeLabels: Record<StallType, string> = {
  standard: "Std",
  large: "Lrg",
  paddock: "Pad",
}

const typeBadgeColors: Record<StallType, string> = {
  standard: "bg-gray-600/30 text-gray-400",
  large: "bg-blue-600/30 text-blue-400",
  paddock: "bg-amber-600/30 text-amber-400",
}

// BREADCRUMB: Border colors based on stall state
function getBorderClass(stall: Stall, horse: Horse | null): string {
  if (stall.isMaintenance) return "border-yellow-600"
  if (horse) return "border-green-600"
  return "border-[#2a2a3e]"
}

function getBackgroundClass(stall: Stall, horse: Horse | null): string {
  if (stall.isMaintenance) return "bg-yellow-900/10"
  if (horse) return "bg-green-900/15"
  return "bg-[#1A1A2E]"
}

export function StallCard({ stall, horse, isEditMode, onDragStart, onDragEnd, onClick }: StallCardProps) {
  const borderClass = getBorderClass(stall, horse)
  const bgClass = getBackgroundClass(stall, horse)

  return (
    <button
      onClick={onClick}
      draggable={isEditMode}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`relative w-full aspect-square p-3 rounded-lg border-2 ${borderClass} ${bgClass} text-left transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer`}
    >
      {/* Drag Handle (edit mode) */}
      {isEditMode && (
        <div className="absolute top-1 left-1 p-1 text-gray-500 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3 w-3" />
        </div>
      )}

      {/* Type Badge */}
      <div className="absolute top-2 right-2">
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${typeBadgeColors[stall.type]}`}>
          {typeLabels[stall.type]}
        </span>
      </div>

      {/* Stall Label */}
      <p className="text-[10px] text-gray-400 font-medium mb-1">{stall.label}</p>

      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-1 min-h-[60px]">
        {stall.isMaintenance ? (
          <>
            <AlertTriangle className="h-6 w-6 text-yellow-500 mb-1" />
            <p className="text-xs text-yellow-400 font-medium">Maintenance</p>
          </>
        ) : horse ? (
          <>
            <Home className="h-5 w-5 text-green-500 mb-1" />
            <p className="text-sm font-semibold text-white truncate w-full text-center">{horse.name}</p>
            <p className="text-[10px] text-gray-400 truncate w-full text-center">{horse.breed}</p>
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 text-gray-500 mb-1" />
            <p className="text-xs text-gray-500">Vacant</p>
          </>
        )}
      </div>
    </button>
  )
}
