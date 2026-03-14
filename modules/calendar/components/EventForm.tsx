/**
 * FILE: modules/calendar/components/EventForm.tsx
 * ZONE: Green
 * PURPOSE: Form to add or edit a calendar event
 * EXPORTS: EventForm
 * DEPENDS ON: lib/types.ts, lucide-react, useAddEvent, useUpdateEvent
 * CONSUMED BY: CalendarPage
 * TESTS: modules/calendar/tests/EventForm.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for calendar page
 */

"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { CalendarEvent, EventCategory, Horse, StaffMember } from "@/lib/types"
import { useAddEvent, useUpdateEvent, type AddEventInput } from "../hooks/useCalendar"

interface EventFormProps {
  event?: CalendarEvent
  initialDate?: Date
  horses: Horse[]
  staff: StaffMember[]
  onClose: () => void
  onSuccess: () => void
}

// BREADCRUMB: Category options with colors
const CATEGORIES: { value: EventCategory; label: string; color: string }[] = [
  { value: "general", label: "General", color: "#2C5F2E" },
  { value: "vet", label: "Vet Visit", color: "#ef4444" },
  { value: "farrier", label: "Farrier", color: "#f97316" },
  { value: "competition", label: "Competition", color: "#3b82f6" },
  { value: "training", label: "Training", color: "#8b5cf6" },
  { value: "feeding", label: "Feeding", color: "#eab308" },
  { value: "vacation", label: "Vacation", color: "#14b8a6" },
  { value: "meeting", label: "Meeting", color: "#6366f1" },
]

// BREADCRUMB: Color presets
const COLOR_PRESETS = [
  "#2C5F2E", "#ef4444", "#f97316", "#3b82f6",
  "#8b5cf6", "#eab308", "#14b8a6", "#6366f1"
]

export function EventForm({ event, initialDate, horses, staff, onClose, onSuccess }: EventFormProps) {
  const isEditing = !!event
  const { addEvent } = useAddEvent()
  const { updateEvent } = useUpdateEvent()

  const defaultDate = initialDate || new Date()
  const defaultStartTime = event?.startTime || defaultDate.toISOString()
  const defaultEndTime = event?.endTime || new Date(defaultDate.getTime() + 60 * 60 * 1000).toISOString()

  const [title, setTitle] = useState(event?.title || "")
  const [category, setCategory] = useState<EventCategory>(event?.category || "general")
  const [allDay, setAllDay] = useState(event?.allDay || false)
  const [startDate, setStartDate] = useState(defaultStartTime.split("T")[0])
  const [startTime, setStartTime] = useState(defaultStartTime.split("T")[1]?.slice(0, 5) || "09:00")
  const [endDate, setEndDate] = useState(defaultEndTime.split("T")[0])
  const [endTime, setEndTime] = useState(defaultEndTime.split("T")[1]?.slice(0, 5) || "10:00")
  const [description, setDescription] = useState(event?.description || "")
  const [location, setLocation] = useState(event?.location || "")
  const [horseId, setHorseId] = useState(event?.horseId || "")
  const [assignedTo, setAssignedTo] = useState<string[]>(event?.assignedTo || [])
  const [color, setColor] = useState(event?.color || CATEGORIES.find(c => c.value === category)?.color || "#2C5F2E")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCategoryChange = (newCategory: EventCategory) => {
    setCategory(newCategory)
    const categoryColor = CATEGORIES.find(c => c.value === newCategory)?.color
    if (categoryColor) setColor(categoryColor)
  }

  const toggleStaffMember = (staffId: string) => {
    setAssignedTo((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    setIsSubmitting(true)

    const startDateTime = allDay
      ? `${startDate}T00:00:00.000Z`
      : `${startDate}T${startTime}:00.000Z`
    const endDateTime = allDay
      ? `${endDate}T23:59:59.000Z`
      : `${endDate}T${endTime}:00.000Z`

    const input: AddEventInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: startDateTime,
      endTime: endDateTime,
      allDay,
      category,
      color,
      location: location.trim() || undefined,
      horseId: horseId || undefined,
      assignedTo,
    }

    let success: boolean

    if (isEditing) {
      success = await updateEvent(event.id, input)
    } else {
      const result = await addEvent(input)
      success = result.success
      if (!success && result.error) setError(result.error)
    }

    setIsSubmitting(false)

    if (success) {
      onSuccess()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-[#0F1117] rounded-lg border border-[#2a2a3e] shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0F1117] border-b border-[#2a2a3e] p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? "Edit Event" : "Add Event"}
          </h2>
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

          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as EventCategory)}
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded bg-[#1A1A2E] border-[#2a2a3e]"
            />
            <label htmlFor="allDay" className="text-sm text-gray-400">All day event</label>
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
            {!allDay && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
            {!allDay && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-[#2a2a3e] text-white text-sm focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Link Horse */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Link to Horse</label>
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

          {/* Assign Staff */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Assign to Staff</label>
            <div className="flex flex-wrap gap-2">
              {staff.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStaffMember(s.id)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    assignedTo.includes(s.id)
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {s.fullName}
                </button>
              ))}
              {staff.length === 0 && (
                <span className="text-xs text-gray-500">No staff members available</span>
              )}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Event Color</label>
            <div className="flex gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#0F1117]" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
