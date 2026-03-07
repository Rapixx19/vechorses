/**
 * FILE: modules/calendar/components/StaffFilterBar.tsx
 * ZONE: Green
 * PURPOSE: Staff avatar chip filter bar for calendar
 * EXPORTS: StaffFilterBar
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: CalendarPage
 * TESTS: modules/calendar/tests/StaffFilterBar.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for staff filtering
 */

"use client"

import type { StaffMember } from "@/lib/types"

interface StaffFilterBarProps {
  staff: StaffMember[]
  selectedStaffId: string | null
  onSelectStaff: (staffId: string | null) => void
}

// BREADCRUMB: Default colors for staff without custom color
const DEFAULT_COLORS = ["#2C5F2E", "#1E40AF", "#7C3AED", "#DC2626", "#EA580C", "#0891B2"]

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function StaffFilterBar({ staff, selectedStaffId, onSelectStaff }: StaffFilterBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* All button */}
      <button
        onClick={() => onSelectStaff(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          selectedStaffId === null
            ? "bg-[#2C5F2E] text-white"
            : "bg-[#1A1A2E] text-gray-400 hover:text-white"
        }`}
      >
        All
      </button>

      {/* Staff chips */}
      {staff.map((member, index) => {
        const isSelected = selectedStaffId === member.id
        const color = member.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]

        return (
          <button
            key={member.id}
            onClick={() => onSelectStaff(isSelected ? null : member.id)}
            className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium transition-all ${
              isSelected
                ? "ring-2 ring-white ring-offset-1 ring-offset-[#0F1117]"
                : "opacity-70 hover:opacity-100"
            }`}
            style={{ backgroundColor: isSelected ? color : "#1A1A2E" }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ backgroundColor: color }}
            >
              {getInitials(member.fullName)}
            </div>
            <span className={isSelected ? "text-white" : "text-gray-300"}>
              {member.fullName.split(" ")[0]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
