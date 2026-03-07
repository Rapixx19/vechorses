/**
 * FILE: modules/dashboard/components/StaffToday.tsx
 * ZONE: Green
 * PURPOSE: Dashboard widget showing who is working today vs on vacation
 * EXPORTS: StaffToday
 * DEPENDS ON: modules/staff/hooks/useStaff, lib/types.ts
 * CONSUMED BY: app/dashboard/page.tsx
 * TESTS: modules/dashboard/tests/StaffToday.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for staff management
 */

"use client"

import Link from "next/link"
import { useStaff } from "@/modules/staff"
import type { StaffStatusDetail } from "@/lib/types"

// BREADCRUMB: Status dot colors
const STATUS_COLORS: Record<StaffStatusDetail, string> = {
  working: "bg-green-500",
  vacation: "bg-yellow-500",
  sick: "bg-red-500",
  "day-off": "bg-gray-500",
  training: "bg-blue-500",
}

const DEFAULT_COLORS = ["#2C5F2E", "#1E40AF", "#7C3AED", "#DC2626", "#EA580C", "#0891B2"]

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function StaffToday() {
  const { staff, isLoading } = useStaff()

  const workingStaff = staff.filter((s) => s.statusDetail === "working")
  const offStaff = staff.filter((s) => s.statusDetail !== "working")

  if (isLoading) {
    return (
      <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Staff Today</h3>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    )
  }

  if (staff.length === 0) {
    return (
      <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Staff Today</h3>
        <p className="text-gray-500 text-sm">No staff members yet</p>
        <Link href="/staff" className="text-sm text-green-400 hover:underline mt-2 inline-block">
          Add staff
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-400">Staff Today</h3>
        <Link href="/staff" className="text-xs text-green-400 hover:underline">
          View all
        </Link>
      </div>

      {/* Working avatars */}
      {workingStaff.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Working ({workingStaff.length})</p>
          <div className="flex flex-wrap gap-2">
            {workingStaff.map((member) => (
              <div key={member.id} className="relative" title={member.fullName}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: member.color || DEFAULT_COLORS[0] }}
                >
                  {getInitials(member.fullName)}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1A1A2E] ${STATUS_COLORS[member.statusDetail]}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Off avatars */}
      {offStaff.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Off/Away ({offStaff.length})</p>
          <div className="flex flex-wrap gap-2">
            {offStaff.map((member) => (
              <div key={member.id} className="relative opacity-60" title={`${member.fullName} - ${member.statusDetail}`}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: member.color || DEFAULT_COLORS[0] }}
                >
                  {getInitials(member.fullName)}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1A1A2E] ${STATUS_COLORS[member.statusDetail]}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Working</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>Vacation</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          <span>Off</span>
        </div>
      </div>
    </div>
  )
}
