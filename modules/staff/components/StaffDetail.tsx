/**
 * FILE: modules/staff/components/StaffDetail.tsx
 * ZONE: Green
 * PURPOSE: Right side panel showing staff member details with tabs
 * EXPORTS: StaffDetail
 * DEPENDS ON: lib/types.ts, lucide-react, useStaffTasks
 * CONSUMED BY: StaffPage
 * TESTS: modules/staff/tests/StaffDetail.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for staff management
 */

"use client"

import { useState } from "react"
import { X, Mail, Phone, MapPin, Calendar, Pencil, Check, Trash2, Plus } from "lucide-react"
import { useStaffTasks, useStaffActions, useUpdateStaff } from "../hooks/useStaff"
import type { StaffMember, StaffTask, StaffStatusDetail, TaskPriority } from "@/lib/types"

interface StaffDetailProps {
  member: StaffMember
  onClose: () => void
  onEdit: () => void
  onAssignTask: () => void
  onRefetch: () => void
}

type TabType = "overview" | "tasks" | "schedule"
type TaskFilter = "all" | "pending" | "completed"

// BREADCRUMB: Status buttons config
const STATUS_OPTIONS: { value: StaffStatusDetail; label: string }[] = [
  { value: "working", label: "Working" },
  { value: "vacation", label: "Vacation" },
  { value: "sick", label: "Sick" },
  { value: "day-off", label: "Day Off" },
]

// BREADCRUMB: Priority badge styles
const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-gray-600/20 text-gray-400",
  medium: "bg-blue-600/20 text-blue-400",
  high: "bg-orange-600/20 text-orange-400",
  urgent: "bg-red-600/20 text-red-400",
}

// BREADCRUMB: Category labels
const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  feeding: "Feeding",
  cleaning: "Cleaning",
  medical: "Medical",
  grooming: "Grooming",
  training: "Training",
  maintenance: "Maintenance",
  other: "Other",
}

const DEFAULT_COLORS = ["#2C5F2E", "#1E40AF", "#7C3AED", "#DC2626", "#EA580C", "#0891B2"]

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function StaffDetail({ member, onClose, onEdit, onAssignTask, onRefetch }: StaffDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all")
  const [vacationStart, setVacationStart] = useState(member.vacationStart || "")
  const [vacationEnd, setVacationEnd] = useState(member.vacationEnd || "")

  const { tasks, isLoading: tasksLoading, refetch: refetchTasks } = useStaffTasks(member.id)
  const { completeTask, deleteTask } = useStaffActions()
  const { updateStatus } = useUpdateStaff()

  const avatarColor = member.color || DEFAULT_COLORS[0]

  const handleStatusChange = async (status: StaffStatusDetail) => {
    const success = await updateStatus(
      member.id,
      status,
      status === "vacation" ? vacationStart : undefined,
      status === "vacation" ? vacationEnd : undefined
    )
    if (success) onRefetch()
  }

  const handleCompleteTask = async (taskId: string) => {
    const success = await completeTask(taskId)
    if (success) refetchTasks()
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return
    const success = await deleteTask(taskId)
    if (success) refetchTasks()
  }

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === "pending") return t.status === "pending"
    if (taskFilter === "completed") return t.status === "completed"
    return true
  })

  // BREADCRUMB: Group tasks by day for schedule view
  const getWeekDays = () => {
    const today = new Date()
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(date)
    }
    return days
  }

  const getTasksForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return tasks.filter((t) => t.dueDate === dateStr)
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0F1117] border-l border-gray-800 shadow-xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#0F1117] border-b border-gray-800 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Staff Details</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {(["overview", "tasks", "schedule"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize ${
              activeTab === tab
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Avatar and name */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: avatarColor }}
              >
                {getInitials(member.fullName)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{member.fullName}</h3>
                <p className="text-sm text-gray-400 capitalize">{member.role}</p>
              </div>
              <button onClick={onEdit} className="ml-auto p-2 hover:bg-gray-800 rounded">
                <Pencil className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-300">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-300">{member.phone}</span>
                </div>
              )}
              {member.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-300">{member.address}</span>
                </div>
              )}
              {member.startDate && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-300">
                    Started {new Date(member.startDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Contract type */}
            <div className="p-3 rounded-lg bg-[#1A1A2E]">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contract</p>
              <p className="text-white capitalize">{member.contractType}</p>
            </div>

            {/* Emergency contact */}
            {member.emergencyContactName && (
              <div className="p-3 rounded-lg bg-[#1A1A2E]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Emergency Contact</p>
                <p className="text-white">{member.emergencyContactName}</p>
                {member.emergencyContactPhone && (
                  <p className="text-sm text-gray-400">{member.emergencyContactPhone}</p>
                )}
              </div>
            )}

            {/* Notes */}
            {member.notes && (
              <div className="p-3 rounded-lg bg-[#1A1A2E]">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-gray-300 text-sm">{member.notes}</p>
              </div>
            )}

            {/* Status selector */}
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      member.statusDetail === opt.value
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Vacation dates */}
              {member.statusDetail === "vacation" && (
                <div className="flex gap-3 mt-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">From</label>
                    <input
                      type="date"
                      value={vacationStart}
                      onChange={(e) => setVacationStart(e.target.value)}
                      onBlur={() => handleStatusChange("vacation")}
                      className="w-full mt-1 px-3 py-2 rounded bg-[#252538] border border-gray-600 text-white text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">To</label>
                    <input
                      type="date"
                      value={vacationEnd}
                      onChange={(e) => setVacationEnd(e.target.value)}
                      onBlur={() => handleStatusChange("vacation")}
                      className="w-full mt-1 px-3 py-2 rounded bg-[#252538] border border-gray-600 text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-4">
            {/* Task actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(["all", "pending", "completed"] as TaskFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    className={`px-3 py-1 rounded text-xs font-medium capitalize ${
                      taskFilter === f ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                onClick={onAssignTask}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm bg-green-600 text-white hover:bg-green-700"
              >
                <Plus className="h-3 w-3" />
                Assign Task
              </button>
            </div>

            {/* Tasks list */}
            {tasksLoading ? (
              <p className="text-gray-500 text-center py-4">Loading...</p>
            ) : filteredTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tasks found</p>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onComplete={() => handleCompleteTask(task.id)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">This week&apos;s tasks</p>
            {getWeekDays().map((day) => {
              const dayTasks = getTasksForDay(day)
              const isToday = day.toDateString() === new Date().toDateString()
              return (
                <div key={day.toISOString()} className="space-y-2">
                  <p className={`text-sm font-medium ${isToday ? "text-green-400" : "text-gray-400"}`}>
                    {day.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                    {isToday && " (Today)"}
                  </p>
                  {dayTasks.length === 0 ? (
                    <p className="text-xs text-gray-600 pl-2">No tasks</p>
                  ) : (
                    <div className="space-y-1 pl-2">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs px-2 py-1 rounded ${PRIORITY_STYLES[task.priority]}`}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// BREADCRUMB: Task item subcomponent
function TaskItem({
  task,
  onComplete,
  onDelete,
}: {
  task: StaffTask
  onComplete: () => void
  onDelete: () => void
}) {
  const isCompleted = task.status === "completed"

  return (
    <div className={`p-3 rounded-lg ${isCompleted ? "bg-gray-800/50" : "bg-[#1A1A2E]"}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onComplete}
          disabled={isCompleted}
          className={`mt-0.5 p-1 rounded ${
            isCompleted ? "bg-green-600/20 text-green-400" : "bg-gray-700 text-gray-400 hover:bg-gray-600"
          }`}
        >
          <Check className="h-3 w-3" />
        </button>
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${isCompleted ? "text-gray-500 line-through" : "text-white"}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${PRIORITY_STYLES[task.priority]}`}>
              {task.priority}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
              {CATEGORY_LABELS[task.category]}
            </span>
            {task.dueDate && (
              <span className="text-[10px] text-gray-500">
                Due {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.horseName && (
              <span className="text-[10px] text-blue-400">{task.horseName}</span>
            )}
          </div>
        </div>
        <button onClick={onDelete} className="p-1 text-gray-500 hover:text-red-400">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
