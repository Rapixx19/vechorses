/**
 * FILE: modules/staff/components/StaffCard.tsx
 * ZONE: Green
 * PURPOSE: Premium visual card showing staff member info with status, animations, and quick actions
 * EXPORTS: StaffCard
 * DEPENDS ON: lib/types.ts, lucide-react, framer-motion
 * CONSUMED BY: StaffPage
 * TESTS: modules/staff/tests/StaffCard.test.tsx
 * LAST CHANGED: 2026-03-07 — Premium redesign with animations and role colors
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Phone,
  ClipboardList,
  MoreVertical,
  Check,
  Palmtree,
  ThermometerSun,
  Moon,
  Eye,
  Calendar,
  Rabbit,
} from "lucide-react"
import type { StaffMember, StaffStatusDetail } from "@/lib/types"

interface StaffCardProps {
  member: StaffMember
  index: number
  roleColor: string
  onClick: () => void
  onStatusChange: (status: StaffStatusDetail) => void
  onAssignTask: () => void
}

// BREADCRUMB: Status config for visual display
const STATUS_CONFIG: Record<
  StaffStatusDetail,
  { color: string; bgColor: string; label: string; icon: string }
> = {
  working: { color: "bg-green-500", bgColor: "bg-green-500/10", label: "Working", icon: "🟢" },
  vacation: { color: "bg-yellow-500", bgColor: "bg-yellow-500/10", label: "On Vacation", icon: "🌴" },
  sick: { color: "bg-red-500", bgColor: "bg-red-500/10", label: "Sick Leave", icon: "🔴" },
  "day-off": { color: "bg-gray-500", bgColor: "bg-gray-500/10", label: "Day Off", icon: "⚫" },
  training: { color: "bg-blue-500", bgColor: "bg-blue-500/10", label: "Training", icon: "📚" },
}

// BREADCRUMB: Status border colors
const STATUS_BORDER_COLORS: Record<StaffStatusDetail, string> = {
  working: "#22c55e",
  vacation: "#eab308",
  sick: "#ef4444",
  "day-off": "#6b7280",
  training: "#3b82f6",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// BREADCRUMB: Format start date as "Since Jan 2023"
function formatStartDate(dateStr?: string): string | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return `Since ${date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
}

export function StaffCard({
  member,
  index,
  roleColor,
  onClick,
  onStatusChange,
  onAssignTask,
}: StaffCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const status = STATUS_CONFIG[member.statusDetail]
  const borderColor = STATUS_BORDER_COLORS[member.statusDetail]
  const startDateStr = formatStartDate(member.startDate)

  const handleStatusClick = (e: React.MouseEvent, newStatus: StaffStatusDetail) => {
    e.stopPropagation()
    onStatusChange(newStatus)
    setShowMenu(false)
  }

  // Calculate mock stats (in real app, these would come from the member data)
  const pendingTasks = member.pendingTasksCount || 0
  const completedTasks = Math.floor(Math.random() * 5) // Mock
  const horsesAssigned = Math.floor(Math.random() * 6) + 1 // Mock

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
      onClick={onClick}
      className="relative rounded-xl overflow-hidden cursor-pointer transition-all"
      style={{ backgroundColor: "#1A1A2E" }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: borderColor }}
      />

      <div className="p-4 pl-5">
        {/* Quick status menu button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 mt-1 w-44 rounded-xl shadow-xl z-50 py-2 border border-gray-700"
                style={{ backgroundColor: "#252538" }}
              >
                <button
                  onClick={(e) => handleStatusClick(e, "working")}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-700/50 text-gray-300"
                >
                  <Check className="h-4 w-4 text-green-400" />
                  Set Working
                </button>
                <button
                  onClick={(e) => handleStatusClick(e, "vacation")}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-700/50 text-gray-300"
                >
                  <Palmtree className="h-4 w-4 text-yellow-400" />
                  Set Vacation
                </button>
                <button
                  onClick={(e) => handleStatusClick(e, "sick")}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-700/50 text-gray-300"
                >
                  <ThermometerSun className="h-4 w-4 text-red-400" />
                  Set Sick
                </button>
                <button
                  onClick={(e) => handleStatusClick(e, "day-off")}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-700/50 text-gray-300"
                >
                  <Moon className="h-4 w-4 text-gray-400" />
                  Set Day Off
                </button>
              </motion.div>
            </>
          )}
        </div>

        {/* Header: Avatar and name */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar with gradient based on role color */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
            }}
          >
            {getInitials(member.fullName)}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            {/* Name */}
            <h3 className="font-semibold text-white truncate text-lg">
              {member.fullName.toUpperCase()}
            </h3>
            {/* Start date */}
            {startDateStr && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <Calendar className="h-3 w-3" />
                {startDateStr}
              </div>
            )}
          </div>
        </div>

        {/* Status badge with animated pulse */}
        <div className="mb-4">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${status.bgColor}`}
          >
            {member.statusDetail === "working" ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            ) : (
              <span>{status.icon}</span>
            )}
            <span
              className={
                member.statusDetail === "working"
                  ? "text-green-400"
                  : member.statusDetail === "vacation"
                    ? "text-yellow-400"
                    : member.statusDetail === "sick"
                      ? "text-red-400"
                      : member.statusDetail === "training"
                        ? "text-blue-400"
                        : "text-gray-400"
              }
            >
              {status.label}
            </span>
          </div>
          {member.statusDetail === "vacation" && member.vacationEnd && (
            <p className="text-xs text-gray-500 mt-1 ml-1">
              until {new Date(member.vacationEnd).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Stats mini-cards */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 rounded-lg bg-[#252538] p-2.5 text-center">
            <p className="text-lg font-bold text-white">{pendingTasks}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Tasks</p>
          </div>
          <div className="flex-1 rounded-lg bg-[#252538] p-2.5 text-center">
            <p className="text-lg font-bold text-green-400">{completedTasks}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Done</p>
          </div>
          <div className="flex-1 rounded-lg bg-[#252538] p-2.5 text-center">
            <div className="flex items-center justify-center gap-1">
              <Rabbit className="h-4 w-4 text-amber-400" />
              <p className="text-lg font-bold text-amber-400">{horsesAssigned}</p>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Horses</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-[#252538] text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <Eye className="h-4 w-4" />
            View Profile
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAssignTask()
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{
              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
            }}
          >
            <ClipboardList className="h-4 w-4" />
            Assign Task
          </button>
        </div>
      </div>
    </motion.div>
  )
}
