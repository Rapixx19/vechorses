/**
 * FILE: modules/staff/components/StaffCard.tsx
 * ZONE: Green
 * PURPOSE: Visual card showing staff member info with status and quick actions
 * EXPORTS: StaffCard
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: StaffPage
 * TESTS: modules/staff/tests/StaffCard.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for staff management
 */

"use client"

import { useState } from "react"
import { Phone, ClipboardList, MoreVertical, Check, Palmtree, ThermometerSun, Moon } from "lucide-react"
import type { StaffMember, StaffStatusDetail } from "@/lib/types"

interface StaffCardProps {
  member: StaffMember
  onClick: () => void
  onStatusChange: (status: StaffStatusDetail) => void
}

// BREADCRUMB: Status config for visual display
const STATUS_CONFIG: Record<StaffStatusDetail, { color: string; bgColor: string; label: string }> = {
  working: { color: "bg-green-500", bgColor: "bg-green-500/10", label: "Working" },
  vacation: { color: "bg-yellow-500", bgColor: "bg-yellow-500/10", label: "Vacation" },
  sick: { color: "bg-red-500", bgColor: "bg-red-500/10", label: "Sick" },
  "day-off": { color: "bg-gray-500", bgColor: "bg-gray-500/10", label: "Day Off" },
  training: { color: "bg-blue-500", bgColor: "bg-blue-500/10", label: "Training" },
}

// BREADCRUMB: Role badges
const ROLE_CONFIG: Record<string, { bg: string; text: string }> = {
  owner: { bg: "bg-purple-600/20", text: "text-purple-400" },
  manager: { bg: "bg-blue-600/20", text: "text-blue-400" },
  staff: { bg: "bg-gray-600/20", text: "text-gray-400" },
  custom: { bg: "bg-amber-600/20", text: "text-amber-400" },
}

// BREADCRUMB: Default colors for avatars
const DEFAULT_COLORS = ["#2C5F2E", "#1E40AF", "#7C3AED", "#DC2626", "#EA580C", "#0891B2"]

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function StaffCard({ member, onClick, onStatusChange }: StaffCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const status = STATUS_CONFIG[member.statusDetail]
  const role = ROLE_CONFIG[member.role] || ROLE_CONFIG.staff
  const avatarColor = member.color || DEFAULT_COLORS[0]

  const handleStatusClick = (e: React.MouseEvent, newStatus: StaffStatusDetail) => {
    e.stopPropagation()
    onStatusChange(newStatus)
    setShowMenu(false)
  }

  return (
    <div
      onClick={onClick}
      className="relative rounded-lg p-4 cursor-pointer transition-all hover:ring-2 hover:ring-green-500/50"
      style={{ backgroundColor: "#1A1A2E" }}
    >
      {/* Quick status menu */}
      <div className="absolute top-3 right-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="p-1 rounded hover:bg-gray-700"
        >
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </button>

        {showMenu && (
          <div
            className="absolute right-0 mt-1 w-40 rounded-md shadow-lg z-10 py-1"
            style={{ backgroundColor: "#252538" }}
          >
            <button
              onClick={(e) => handleStatusClick(e, "working")}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-700"
            >
              <Check className="h-4 w-4 text-green-400" />
              Set Working
            </button>
            <button
              onClick={(e) => handleStatusClick(e, "vacation")}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-700"
            >
              <Palmtree className="h-4 w-4 text-yellow-400" />
              Set Vacation
            </button>
            <button
              onClick={(e) => handleStatusClick(e, "sick")}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-700"
            >
              <ThermometerSun className="h-4 w-4 text-red-400" />
              Set Sick
            </button>
            <button
              onClick={(e) => handleStatusClick(e, "day-off")}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-700"
            >
              <Moon className="h-4 w-4 text-gray-400" />
              Set Day Off
            </button>
          </div>
        )}
      </div>

      {/* Avatar and info */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {getInitials(member.fullName)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name and role */}
          <h3 className="font-semibold text-white truncate">{member.fullName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded ${role.bg} ${role.text}`}>
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            </span>
            <span className="text-xs text-gray-500">{member.contractType}</span>
          </div>
        </div>
      </div>

      {/* Status and details */}
      <div className="mt-3 space-y-2">
        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.color}`} />
          <span className={`text-sm ${status.bgColor} px-2 py-0.5 rounded`}>
            {status.label}
          </span>
          {member.statusDetail === "vacation" && member.vacationEnd && (
            <span className="text-xs text-gray-500">
              until {new Date(member.vacationEnd).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Phone */}
        {member.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Phone className="h-3 w-3" />
            <span>{member.phone}</span>
          </div>
        )}

        {/* Tasks count */}
        {(member.pendingTasksCount ?? 0) > 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <ClipboardList className="h-3 w-3" />
            <span>{member.pendingTasksCount} pending tasks</span>
          </div>
        )}
      </div>
    </div>
  )
}
