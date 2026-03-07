/**
 * FILE: modules/calendar/components/CalendarPage.tsx
 * ZONE: Green
 * PURPOSE: Main calendar page with views, events, and integration buttons
 * EXPORTS: CalendarPage
 * DEPENDS ON: useCalendar, useHorses, useStaff, CalendarView, EventForm, EventDetail
 * CONSUMED BY: app/calendar/page.tsx
 * TESTS: modules/calendar/tests/CalendarPage.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for calendar page
 */

"use client"

import { useState, useMemo } from "react"
import { Plus, Loader2 } from "lucide-react"
import { useCalendar } from "../hooks/useCalendar"
import { useHorses } from "@/modules/horses"
import { useStaff } from "@/modules/staff"
import { useAuth } from "@/lib/hooks/useAuth"
import { CalendarView } from "./CalendarView"
import { EventForm } from "./EventForm"
import { EventDetail } from "./EventDetail"
import type { CalendarEvent, CalendarViewMode } from "@/lib/types"

type ModalState =
  | { type: "form"; event?: CalendarEvent; initialDate?: Date }
  | { type: "detail"; event: CalendarEvent }
  | null

export function CalendarPage() {
  const { currentUser } = useAuth()
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [modalState, setModalState] = useState<ModalState>(null)

  // Calculate date range for fetching events
  const dateRange = useMemo(() => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)

    if (viewMode === "month") {
      start.setDate(1)
      start.setMonth(start.getMonth() - 1)
      end.setMonth(end.getMonth() + 2)
    } else if (viewMode === "week") {
      start.setDate(start.getDate() - 7)
      end.setDate(end.getDate() + 14)
    } else {
      start.setDate(start.getDate() - 1)
      end.setDate(end.getDate() + 2)
    }

    return { startDate: start, endDate: end }
  }, [currentDate, viewMode])

  const { events, isLoading: eventsLoading, refetch } = useCalendar(dateRange)
  const { horses, isLoading: horsesLoading } = useHorses()
  const { staff, isLoading: staffLoading } = useStaff()

  const isLoading = eventsLoading || horsesLoading || staffLoading

  // BREADCRUMB: Check if user can edit (owner or manager)
  const canEdit = currentUser?.role === "owner" || currentUser?.role === "manager"

  const handleEventClick = (event: CalendarEvent) => {
    setModalState({ type: "detail", event })
  }

  const handleDayClick = (date: Date) => {
    if (canEdit) {
      setModalState({ type: "form", initialDate: date })
    }
  }

  const handleAddEvent = () => {
    setModalState({ type: "form", initialDate: currentDate })
  }

  const handleEditEvent = () => {
    if (modalState?.type === "detail") {
      setModalState({ type: "form", event: modalState.event })
    }
  }

  const showComingSoon = () => {
    alert("Coming Soon! Google Calendar and Outlook integration will be available in a future update.")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2C5F2E]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Calendar</h1>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
            {(["month", "week", "day"] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium capitalize ${
                  viewMode === mode
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Integration Buttons */}
          <button
            onClick={showComingSoon}
            className="px-3 py-2 rounded-md text-sm bg-[#1A1A2E] text-gray-400 hover:text-white flex items-center gap-2"
          >
            <span>📅</span>
            Connect Google
          </button>
          <button
            onClick={showComingSoon}
            className="px-3 py-2 rounded-md text-sm bg-[#1A1A2E] text-gray-400 hover:text-white flex items-center gap-2"
          >
            <span>📅</span>
            Connect Outlook
          </button>

          {/* Add Event Button */}
          {canEdit && (
            <button
              onClick={handleAddEvent}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ backgroundColor: "#2C5F2E" }}
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          )}
        </div>
      </div>

      {/* Category Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { label: "General", color: "#2C5F2E" },
          { label: "Vet", color: "#ef4444" },
          { label: "Farrier", color: "#f97316" },
          { label: "Competition", color: "#3b82f6" },
          { label: "Training", color: "#8b5cf6" },
          { label: "Feeding", color: "#eab308" },
          { label: "Vacation", color: "#14b8a6" },
          { label: "Meeting", color: "#6366f1" },
        ].map((cat) => (
          <div key={cat.label} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-gray-400">{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar View */}
      <CalendarView
        events={events}
        viewMode={viewMode}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onEventClick={handleEventClick}
        onDayClick={handleDayClick}
      />

      {/* Event Detail Sheet */}
      {modalState?.type === "detail" && (
        <EventDetail
          event={modalState.event}
          staff={staff}
          canEdit={canEdit}
          onClose={() => setModalState(null)}
          onEdit={handleEditEvent}
          onDelete={refetch}
        />
      )}

      {/* Event Form Modal */}
      {modalState?.type === "form" && (
        <EventForm
          event={modalState.event}
          initialDate={modalState.initialDate}
          horses={horses}
          staff={staff}
          onClose={() => setModalState(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  )
}
