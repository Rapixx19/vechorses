/**
 * FILE: modules/calendar/components/EventDetail.tsx
 * ZONE: Green
 * PURPOSE: Sheet showing event details with edit/delete options
 * EXPORTS: EventDetail
 * DEPENDS ON: lib/types.ts, lucide-react, useDeleteEvent
 * CONSUMED BY: CalendarPage
 * TESTS: modules/calendar/tests/EventDetail.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for calendar page
 */

"use client"

import { X, MapPin, Calendar, Clock, Pencil, Trash2, Tag } from "lucide-react"
import type { CalendarEvent, StaffMember } from "@/lib/types"
import { useDeleteEvent } from "../hooks/useCalendar"

interface EventDetailProps {
  event: CalendarEvent
  staff: StaffMember[]
  canEdit: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

// BREADCRUMB: Category labels
const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  vet: "Vet Visit",
  farrier: "Farrier",
  competition: "Competition",
  training: "Training",
  feeding: "Feeding",
  vacation: "Vacation",
  meeting: "Meeting",
}

const DEFAULT_COLORS = ["#2C5F2E", "#1E40AF", "#7C3AED", "#DC2626", "#EA580C", "#0891B2"]

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function EventDetail({ event, staff, canEdit, onClose, onEdit, onDelete }: EventDetailProps) {
  const { deleteEvent } = useDeleteEvent()

  const handleDelete = async () => {
    if (!confirm("Delete this event?")) return
    const success = await deleteEvent(event.id)
    if (success) {
      onDelete()
      onClose()
    }
  }

  const startDate = new Date(event.startTime)
  const endDate = new Date(event.endTime)

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

  const assignedStaff = staff.filter((s) => event.assignedTo.includes(s.id))

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0F1117] border-l border-gray-800 shadow-xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#0F1117] border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Event Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-sm bg-gray-700 text-white hover:bg-gray-600"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Title and category */}
        <div>
          <div
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: event.color }}
          />
          <h3 className="text-xl font-semibold text-white inline">{event.title}</h3>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
              <Tag className="h-3 w-3" />
              {CATEGORY_LABELS[event.category] || event.category}
            </span>
          </div>
        </div>

        {/* Date and time */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-300">{formatDate(startDate)}</span>
          </div>
          {!event.allDay && (
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-300">
                {formatTime(startDate)} - {formatTime(endDate)}
              </span>
            </div>
          )}
          {event.allDay && (
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-300">All day</span>
            </div>
          )}
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-300">{event.location}</span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="p-3 rounded-lg bg-[#1A1A2E]">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Description</p>
            <p className="text-gray-300 text-sm">{event.description}</p>
          </div>
        )}

        {/* Linked horse */}
        {event.horseName && (
          <div className="p-3 rounded-lg bg-[#1A1A2E]">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Linked Horse</p>
            <p className="text-white">{event.horseName}</p>
          </div>
        )}

        {/* Assigned staff */}
        {assignedStaff.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Assigned Staff</p>
            <div className="flex flex-wrap gap-2">
              {assignedStaff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 px-2 py-1 rounded-full bg-[#1A1A2E]"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-medium"
                    style={{ backgroundColor: member.color || DEFAULT_COLORS[0] }}
                  >
                    {getInitials(member.fullName)}
                  </div>
                  <span className="text-sm text-gray-300">{member.fullName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External source */}
        {event.externalSource && (
          <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-600/30">
            <p className="text-xs text-blue-400">
              Synced from {event.externalSource}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
