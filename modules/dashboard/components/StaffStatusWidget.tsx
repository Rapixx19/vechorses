/**
 * FILE: modules/dashboard/components/StaffStatusWidget.tsx
 * ZONE: Green
 * PURPOSE: Mini staff overview with status indicators
 * EXPORTS: StaffStatusWidget
 * DEPENDS ON: framer-motion
 * CONSUMED BY: DashboardPage
 * TESTS: modules/dashboard/tests/StaffStatusWidget.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for lively dashboard
 */

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Users } from "lucide-react"
import type { StaffMember } from "@/lib/types"

interface StaffStatusWidgetProps {
  staff: StaffMember[]
}

// BREADCRUMB: Status colors
const STATUS_COLORS: Record<string, { dot: string; label: string }> = {
  working: { dot: "bg-green-500", label: "Working" },
  vacation: { dot: "bg-yellow-500", label: "Vacation" },
  sick: { dot: "bg-red-500", label: "Sick" },
  "day-off": { dot: "bg-gray-500", label: "Day Off" },
  training: { dot: "bg-blue-500", label: "Training" },
}

const DEFAULT_COLORS = ["#2C5F2E", "#1E40AF", "#7C3AED", "#DC2626", "#EA580C", "#0891B2"]

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function StaffStatusWidget({ staff }: StaffStatusWidgetProps) {
  const activeStaff = staff.filter((s) => s.isActive)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-lg border border-[var(--border)] bg-[#1A1A2E]/50 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#2C5F2E]" />
          <h3 className="text-sm font-medium text-white">Staff Status</h3>
        </div>
        <Link href="/staff" className="text-xs text-gray-400 hover:text-white">
          Manage
        </Link>
      </div>

      {activeStaff.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No staff members</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {activeStaff.map((member, i) => {
            const color = member.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]
            const statusInfo = STATUS_COLORS[member.statusDetail] || STATUS_COLORS.working

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                className="relative group"
                title={`${member.fullName} - ${statusInfo.label}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: color }}
                >
                  {getInitials(member.fullName)}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0F1117] ${statusInfo.dot}`}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-gray-800 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {member.fullName}
                  <br />
                  <span className="text-gray-400">{statusInfo.label}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[#2a2a3e]">
        {Object.entries(STATUS_COLORS).map(([key, value]) => {
          const count = activeStaff.filter((s) => s.statusDetail === key).length
          if (count === 0) return null
          return (
            <div key={key} className="flex items-center gap-1 text-xs text-gray-400">
              <div className={`w-2 h-2 rounded-full ${value.dot}`} />
              <span>{count}</span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
