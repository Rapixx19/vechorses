/**
 * FILE: modules/staff/components/StaffPage.tsx
 * ZONE: Green
 * PURPOSE: Premium staff management page with animated cards, views, and modals
 * EXPORTS: StaffPage
 * DEPENDS ON: useStaff, useHorses, StaffCard, StaffDetail, StaffForm, TaskAssignSheet, framer-motion
 * CONSUMED BY: app/staff/page.tsx
 * TESTS: modules/staff/tests/StaffPage.test.tsx
 * LAST CHANGED: 2026-03-07 — Premium redesign with animations and multiple views
 */

"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  UserPlus,
  Users2,
  LayoutGrid,
  List,
  CalendarDays,
  Phone,
  MoreHorizontal,
  Briefcase,
} from "lucide-react"
import { useStaff, useUpdateStaff, useStaffTasks } from "../hooks/useStaff"
import { useHorses } from "@/modules/horses"
import { Skeleton } from "@/modules/dashboard"
import { StaffCard } from "./StaffCard"
import { StaffDetail } from "./StaffDetail"
import { StaffForm } from "./StaffForm"
import { TaskAssignSheet } from "./TaskAssignSheet"
import type { StaffMember, StaffStatusDetail } from "@/lib/types"

type ModalState =
  | { type: "detail"; member: StaffMember }
  | { type: "form"; member?: StaffMember }
  | { type: "assign-task"; member: StaffMember }
  | null

type ViewMode = "cards" | "list" | "schedule"

// BREADCRUMB: Role colors for premium styling
const ROLE_COLORS: Record<string, string> = {
  owner: "#f59e0b",
  manager: "#3b82f6",
  "head-groom": "#10b981",
  groom: "#14b8a6",
  instructor: "#8b5cf6",
  vet: "#ef4444",
  farrier: "#f97316",
  staff: "#6b7280",
  custom: "#6b7280",
}

// BREADCRUMB: Horse silhouette SVG for header background
function HorseSilhouette() {
  return (
    <svg
      viewBox="0 0 200 120"
      className="absolute right-4 sm:right-8 bottom-0 h-32 sm:h-40 opacity-10"
      fill="currentColor"
    >
      <path d="M180 20c-5 0-10 3-14 7-3-2-7-4-12-4-8 0-14 4-18 10-3-1-6-2-9-2-12 0-22 8-26 19-10 2-18 10-18 20v30h8v-12c0-4 2-8 6-10 2 8 8 14 18 14h12c8 0 14-4 18-10 4 6 10 10 18 10h12c10 0 18-6 20-14 4 2 6 6 6 10v12h8v-30c0-10-8-18-18-20-4-11-14-19-26-19-3 0-6 1-9 2-4-6-10-10-18-10-5 0-9 2-12 4-4-4-9-7-14-7z" />
    </svg>
  )
}

// BREADCRUMB: Team silhouette SVG for header
function TeamSilhouette() {
  return (
    <svg
      viewBox="0 0 120 80"
      className="absolute right-32 sm:right-48 bottom-4 h-20 sm:h-24 opacity-5"
      fill="currentColor"
    >
      <circle cx="30" cy="20" r="12" />
      <path d="M15 75V55c0-8 7-15 15-15s15 7 15 15v20H15z" />
      <circle cx="60" cy="15" r="14" />
      <path d="M42 75V52c0-9 8-17 18-17s18 8 18 17v23H42z" />
      <circle cx="90" cy="20" r="12" />
      <path d="M75 75V55c0-8 7-15 15-15s15 7 15 15v20H75z" />
    </svg>
  )
}

// BREADCRUMB: Skeleton loading state for StaffPage
function StaffPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    </div>
  )
}

// BREADCRUMB: Count-up animation hook
function useCountUp(end: number, duration: number = 800): number {
  const [count, setCount] = useState(0)

  useState(() => {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - progress) * (1 - progress)
      setCount(Math.floor(end * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  })

  return count
}

// BREADCRUMB: Animated stat card component
function StatCard({
  value,
  label,
  gradient,
  delay = 0,
}: {
  value: number
  label: string
  gradient: string
  delay?: number
}) {
  const animatedValue = useCountUp(value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-xl p-4"
      style={{ background: gradient }}
    >
      <div className="relative z-10">
        <p className="text-3xl sm:text-4xl font-bold text-white">{animatedValue}</p>
        <p className="text-sm text-white/70 mt-1">{label}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
    </motion.div>
  )
}

export function StaffPage() {
  const { staff, isLoading, refetch } = useStaff()
  const { horses } = useHorses()
  const { tasks } = useStaffTasks()
  const { updateStatus } = useUpdateStaff()
  const [modalState, setModalState] = useState<ModalState>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("cards")

  // BREADCRUMB: Stats calculations
  const stats = useMemo(() => {
    const totalStaff = staff.length
    const workingNow = staff.filter((s) => s.statusDetail === "working").length
    const onVacation = staff.filter((s) => s.statusDetail === "vacation").length
    const totalTasks = tasks.filter((t) => t.status === "pending").length
    return { totalStaff, workingNow, onVacation, totalTasks }
  }, [staff, tasks])

  // BREADCRUMB: Get week days for schedule view
  const weekDays = useMemo(() => {
    const days = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(date)
    }
    return days
  }, [])

  const handleStatusChange = async (memberId: string, status: StaffStatusDetail) => {
    await updateStatus(memberId, status)
    refetch()
  }

  const handleScheduleCellClick = async (memberId: string, _date: Date, status: StaffStatusDetail) => {
    await updateStatus(memberId, status)
    refetch()
  }

  if (isLoading) {
    return <StaffPageSkeleton />
  }

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        <HorseSilhouette />
        <TeamSilhouette />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Team</h1>
            <p className="text-sm text-gray-400 mt-1">{formattedDate}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Status pills */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {stats.workingNow} Working
            </div>
            {stats.onVacation > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                {stats.onVacation} Vacation
              </div>
            )}

            {/* Add button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalState({ type: "form" })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white min-h-[44px]"
              style={{
                background: "linear-gradient(135deg, #2C5F2E 0%, #3D8B40 100%)",
              }}
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Staff Member</span>
              <span className="sm:hidden">Add</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          value={stats.totalStaff}
          label="Total Staff"
          gradient="linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)"
          delay={0.1}
        />
        <StatCard
          value={stats.workingNow}
          label="Working Now"
          gradient="linear-gradient(135deg, #1a4d3a 0%, #0d2818 100%)"
          delay={0.2}
        />
        <StatCard
          value={stats.onVacation}
          label="On Vacation"
          gradient="linear-gradient(135deg, #5c4a1f 0%, #2d2510 100%)"
          delay={0.3}
        />
        <StatCard
          value={stats.totalTasks}
          label="Pending Tasks"
          gradient="linear-gradient(135deg, #3d2963 0%, #1e1433 100%)"
          delay={0.4}
        />
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg overflow-hidden bg-[#1A1A2E] border border-gray-800">
          {[
            { mode: "cards" as ViewMode, icon: LayoutGrid, label: "Cards" },
            { mode: "list" as ViewMode, icon: List, label: "List" },
            { mode: "schedule" as ViewMode, icon: CalendarDays, label: "Schedule" },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-medium transition-all min-h-[44px] ${
                viewMode === mode
                  ? "bg-[#2C5F2E] text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content based on view mode */}
      <AnimatePresence mode="wait">
        {staff.length === 0 ? (
          /* Empty State */
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1A1A2E] to-[#252538] flex items-center justify-center mb-6"
            >
              <Users2 className="h-12 w-12 text-gray-500" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">Your team is waiting to be built</h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              Add your first staff member to start managing your stable team
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setModalState({ type: "form" })}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
              style={{
                background: "linear-gradient(135deg, #2C5F2E 0%, #3D8B40 100%)",
              }}
            >
              <UserPlus className="h-5 w-5" />
              Add First Staff Member
            </motion.button>
          </motion.div>
        ) : viewMode === "cards" ? (
          /* Cards View */
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {staff.map((member, index) => (
              <StaffCard
                key={member.id}
                member={member}
                index={index}
                roleColor={ROLE_COLORS[member.role] || ROLE_COLORS.staff}
                onClick={() => setModalState({ type: "detail", member })}
                onStatusChange={(status) => handleStatusChange(member.id, status)}
                onAssignTask={() => setModalState({ type: "assign-task", member })}
              />
            ))}
          </motion.div>
        ) : viewMode === "list" ? (
          /* List View */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl overflow-hidden border border-gray-800"
            style={{ backgroundColor: "#1A1A2E" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                      Staff Member
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                      Role
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                      Tasks
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                      Phone
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member, index) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setModalState({ type: "detail", member })}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                            style={{
                              background: `linear-gradient(135deg, ${ROLE_COLORS[member.role] || ROLE_COLORS.staff}, ${ROLE_COLORS[member.role] || ROLE_COLORS.staff}88)`,
                            }}
                          >
                            {member.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{member.fullName}</p>
                            <p className="text-xs text-gray-500 sm:hidden capitalize">{member.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `${ROLE_COLORS[member.role] || ROLE_COLORS.staff}20`,
                            color: ROLE_COLORS[member.role] || ROLE_COLORS.staff,
                          }}
                        >
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={member.statusDetail} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-400">{member.pendingTasksCount || 0}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-gray-400">{member.phone || "-"}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setModalState({ type: "assign-task", member })
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          /* Schedule View */
          <motion.div
            key="schedule"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl overflow-hidden border border-gray-800"
            style={{ backgroundColor: "#1A1A2E" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 sticky left-0 bg-[#1A1A2E] z-10">
                      Staff
                    </th>
                    {weekDays.map((day) => {
                      const isToday = day.toDateString() === new Date().toDateString()
                      return (
                        <th
                          key={day.toISOString()}
                          className={`text-center text-xs font-medium uppercase tracking-wider px-2 py-3 min-w-[60px] ${
                            isToday ? "text-green-400" : "text-gray-500"
                          }`}
                        >
                          <div>{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                          <div className="text-[10px]">{day.getDate()}</div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member, index) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-800/50"
                    >
                      <td className="px-4 py-3 sticky left-0 bg-[#1A1A2E] z-10">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                            style={{
                              background: `linear-gradient(135deg, ${ROLE_COLORS[member.role] || ROLE_COLORS.staff}, ${ROLE_COLORS[member.role] || ROLE_COLORS.staff}88)`,
                            }}
                          >
                            {member.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="text-sm text-white font-medium truncate max-w-[100px]">
                            {member.fullName.split(" ")[0]}
                          </span>
                        </div>
                      </td>
                      {weekDays.map((day) => {
                        const isToday = day.toDateString() === new Date().toDateString()
                        return (
                          <td key={day.toISOString()} className="px-2 py-3 text-center">
                            <ScheduleCell
                              status={member.statusDetail}
                              isToday={isToday}
                              onClick={(status) => handleScheduleCellClick(member.id, day, status)}
                            />
                          </td>
                        )
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Sheet */}
      {modalState?.type === "detail" && (
        <StaffDetail
          member={modalState.member}
          onClose={() => setModalState(null)}
          onEdit={() => setModalState({ type: "form", member: modalState.member })}
          onAssignTask={() => setModalState({ type: "assign-task", member: modalState.member })}
          onRefetch={refetch}
        />
      )}

      {/* Form Modal */}
      {modalState?.type === "form" && (
        <StaffForm
          member={modalState.member}
          onClose={() => setModalState(null)}
          onSuccess={refetch}
        />
      )}

      {/* Task Assign Sheet */}
      {modalState?.type === "assign-task" && (
        <TaskAssignSheet
          memberId={modalState.member.id}
          memberName={modalState.member.fullName}
          horses={horses}
          onClose={() => setModalState({ type: "detail", member: modalState.member })}
          onSuccess={refetch}
        />
      )}
    </div>
  )
}

// BREADCRUMB: Status badge component
function StatusBadge({ status }: { status: StaffStatusDetail }) {
  const config: Record<StaffStatusDetail, { bg: string; text: string; label: string; icon?: string }> = {
    working: { bg: "bg-green-500/20", text: "text-green-400", label: "Working", icon: "🟢" },
    vacation: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Vacation", icon: "🌴" },
    sick: { bg: "bg-red-500/20", text: "text-red-400", label: "Sick", icon: "🔴" },
    "day-off": { bg: "bg-gray-500/20", text: "text-gray-400", label: "Day Off", icon: "⚫" },
    training: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Training", icon: "📚" },
  }

  const { bg, text, label } = config[status]

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${bg} ${text}`}>
      {status === "working" && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
      {label}
    </span>
  )
}

// BREADCRUMB: Schedule cell component
function ScheduleCell({
  status,
  isToday,
  onClick,
}: {
  status: StaffStatusDetail
  isToday: boolean
  onClick: (status: StaffStatusDetail) => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  const statusIcons: Record<StaffStatusDetail, string> = {
    working: "🟢",
    vacation: "🌴",
    sick: "🔴",
    "day-off": "⚫",
    training: "📚",
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110 ${
          isToday ? "ring-2 ring-green-500/50" : ""
        }`}
      >
        {statusIcons[status]}
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-[#252538] rounded-lg shadow-xl z-50 py-1 min-w-[120px]">
            {(Object.keys(statusIcons) as StaffStatusDetail[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  onClick(s)
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-700 capitalize"
              >
                <span>{statusIcons[s]}</span>
                {s.replace("-", " ")}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
