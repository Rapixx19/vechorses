/**
 * FILE: modules/calendar/components/WeekOverview.tsx
 * ZONE: Green
 * PURPOSE: Week overview table showing staff tasks by day
 * EXPORTS: WeekOverview
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: CalendarPage
 * TESTS: modules/calendar/tests/WeekOverview.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for week overview
 */

"use client"

import { Plus } from "lucide-react"
import type { StaffMember, StaffTask } from "@/lib/types"

interface WeekOverviewProps {
  staff: StaffMember[]
  tasks: StaffTask[]
  currentDate: Date
  onCellClick: (staffId: string, date: Date) => void
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

// Get the start of the week (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Get array of 7 days starting from Monday
function getWeekDays(date: Date): Date[] {
  const start = getWeekStart(date)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function WeekOverview({ staff, tasks, currentDate, onCellClick }: WeekOverviewProps) {
  const weekDays = getWeekDays(currentDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Group tasks by staff and date
  const getTasksForCell = (staffId: string, date: Date): StaffTask[] => {
    const dateStr = date.toISOString().split("T")[0]
    return tasks.filter(
      (task) => task.assignedTo === staffId && task.dueDate === dateStr
    )
  }

  return (
    <div className="rounded-lg border border-gray-800 overflow-hidden">
      {/* Header row with days */}
      <div className="grid grid-cols-8 bg-[#1A1A2E]">
        <div className="p-3 border-r border-gray-800">
          <span className="text-xs font-medium text-gray-500">Staff</span>
        </div>
        {weekDays.map((day, i) => {
          const isToday = day.getTime() === today.getTime()
          return (
            <div
              key={i}
              className={`p-3 text-center border-r border-gray-800 last:border-r-0 ${
                isToday ? "bg-green-900/20" : ""
              }`}
            >
              <div className="text-xs text-gray-500">{DAY_NAMES[i]}</div>
              <div className={`text-sm font-medium ${isToday ? "text-green-400" : "text-white"}`}>
                {day.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Staff rows */}
      {staff.map((member, memberIndex) => {
        const color = member.color || DEFAULT_COLORS[memberIndex % DEFAULT_COLORS.length]

        return (
          <div key={member.id} className="grid grid-cols-8 border-t border-gray-800">
            {/* Staff info cell */}
            <div className="p-3 border-r border-gray-800 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: color }}
              >
                {getInitials(member.fullName)}
              </div>
              <span className="text-sm text-white truncate">{member.fullName}</span>
            </div>

            {/* Day cells */}
            {weekDays.map((day, dayIndex) => {
              const cellTasks = getTasksForCell(member.id, day)
              const isToday = day.getTime() === today.getTime()
              const isPast = day < today

              return (
                <button
                  key={dayIndex}
                  onClick={() => onCellClick(member.id, day)}
                  className={`p-2 border-r border-gray-800 last:border-r-0 min-h-[60px] text-left transition-colors group ${
                    isToday ? "bg-green-900/10" : isPast ? "bg-gray-900/30" : "hover:bg-gray-800/50"
                  }`}
                >
                  {cellTasks.length > 0 ? (
                    <div className="space-y-1">
                      {cellTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate ${
                            task.status === "completed"
                              ? "bg-gray-700 text-gray-400 line-through"
                              : task.priority === "urgent"
                              ? "bg-red-900/30 text-red-400"
                              : task.priority === "high"
                              ? "bg-orange-900/30 text-orange-400"
                              : "bg-[#2C5F2E]/30 text-green-400"
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {cellTasks.length > 2 && (
                        <div className="text-[10px] text-gray-500 px-1">
                          +{cellTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )
      })}

      {staff.length === 0 && (
        <div className="p-8 text-center text-gray-500 text-sm">
          No staff members found
        </div>
      )}
    </div>
  )
}
