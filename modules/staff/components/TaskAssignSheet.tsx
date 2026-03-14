/**
 * FILE: modules/staff/components/TaskAssignSheet.tsx
 * ZONE: Green
 * PURPOSE: Sheet to assign a task to a staff member with quick templates
 * EXPORTS: TaskAssignSheet
 * DEPENDS ON: lib/types.ts, lucide-react, useStaffActions
 * CONSUMED BY: StaffPage, StaffDetail, CalendarPage
 * TESTS: modules/staff/tests/TaskAssignSheet.test.tsx
 * LAST CHANGED: 2026-03-07 — Added quick task templates and pre-selection
 */

"use client"

import { useState, useEffect } from "react"
import { X, Zap } from "lucide-react"
import type { TaskPriority, TaskCategory, Horse } from "@/lib/types"
import { useStaffActions, type AssignTaskInput } from "../hooks/useStaff"

// BREADCRUMB: Quick task templates for common stable operations
const QUICK_TEMPLATES = [
  { title: "Morning feeding", category: "feeding" as TaskCategory, priority: "high" as TaskPriority },
  { title: "Evening feeding", category: "feeding" as TaskCategory, priority: "high" as TaskPriority },
  { title: "Stall cleaning", category: "cleaning" as TaskCategory, priority: "medium" as TaskPriority },
  { title: "Grooming", category: "grooming" as TaskCategory, priority: "low" as TaskPriority },
  { title: "Exercise", category: "training" as TaskCategory, priority: "medium" as TaskPriority },
]

interface TaskAssignSheetProps {
  memberId: string
  memberName: string
  horses: Horse[]
  onClose: () => void
  onSuccess: () => void
  // New props for pre-selection
  initialDate?: Date
  createCalendarEvent?: boolean
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "feeding", label: "Feeding" },
  { value: "cleaning", label: "Cleaning" },
  { value: "medical", label: "Medical" },
  { value: "grooming", label: "Grooming" },
  { value: "training", label: "Training" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
]

export function TaskAssignSheet({
  memberId,
  memberName,
  horses,
  onClose,
  onSuccess,
  initialDate,
}: TaskAssignSheetProps) {
  const { assignTask } = useStaffActions()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [category, setCategory] = useState<TaskCategory>("general")
  const [dueDate, setDueDate] = useState("")
  const [dueTime, setDueTime] = useState("")
  const [horseId, setHorseId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // BREADCRUMB: Pre-fill date if provided
  useEffect(() => {
    if (initialDate) {
      setDueDate(initialDate.toISOString().split("T")[0])
    }
  }, [initialDate])

  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    setTitle(template.title)
    setCategory(template.category)
    setPriority(template.priority)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    setIsSubmitting(true)

    const input: AssignTaskInput = {
      assignedTo: memberId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      horseId: horseId || undefined,
    }

    const result = await assignTask(input)

    setIsSubmitting(false)

    if (result.success) {
      onSuccess()
      onClose()
    } else {
      setError(result.error || "Failed to assign task")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-[#0F1117] rounded-lg border border-[#2a2a3e] shadow-xl">
        {/* Header */}
        <div className="border-b border-[#2a2a3e] p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Assign Task</h2>
            <p className="text-sm text-gray-400">to {memberName}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-900/20 border border-red-600 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Quick Templates */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-3 w-3 text-yellow-500" />
              <label className="text-xs text-gray-400">Quick Templates</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((template) => (
                <button
                  key={template.title}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="px-2 py-1 rounded text-xs bg-[#1A1A2E] text-gray-300 hover:bg-[#2C5F2E] hover:text-white transition-colors"
                >
                  {template.title}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Feed horses in Block A"
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Additional details..."
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none resize-none"
            />
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Link to Horse */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Link to Horse (optional)</label>
            <select
              value={horseId}
              onChange={(e) => setHorseId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none"
            >
              <option value="">No horse linked</option>
              {horses.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a3e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: "#2C5F2E" }}
            >
              {isSubmitting ? "Assigning..." : "Assign Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
