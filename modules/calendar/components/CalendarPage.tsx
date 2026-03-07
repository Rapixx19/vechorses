/**
 * FILE: modules/calendar/components/CalendarPage.tsx
 * ZONE: Green
 * PURPOSE: Main calendar page with views, events, staff filtering, and week overview
 * EXPORTS: CalendarPage
 * DEPENDS ON: useCalendar, useHorses, useStaff, CalendarView, EventForm, EventDetail, StaffFilterBar, WeekOverview
 * CONSUMED BY: app/calendar/page.tsx
 * TESTS: modules/calendar/tests/CalendarPage.test.tsx
 * LAST CHANGED: 2026-03-07 — Added staff filter bar and week overview
 */

"use client"

import { useState, useMemo } from "react"
import { Plus, Loader2, ClipboardList } from "lucide-react"
import { useCalendar } from "../hooks/useCalendar"
import { useHorses } from "@/modules/horses"
import { useStaff, useStaffTasks, TaskAssignSheet } from "@/modules/staff"
import { useAuth } from "@/lib/hooks/useAuth"
import { CalendarView } from "./CalendarView"
import { EventForm } from "./EventForm"
import { EventDetail } from "./EventDetail"
import { StaffFilterBar } from "./StaffFilterBar"
import { WeekOverview } from "./WeekOverview"
import type { CalendarEvent, CalendarViewMode } from "@/lib/types"

type ModalState =
  | { type: "form"; event?: CalendarEvent; initialDate?: Date }
  | { type: "detail"; event: CalendarEvent }
  | { type: "task"; staffId: string; staffName: string; date: Date }
  | null

export function CalendarPage() {
  const { currentUser } = useAuth()
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [modalState, setModalState] = useState<ModalState>(null)
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [showWeekOverview, setShowWeekOverview] = useState(false)

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
  const { tasks, isLoading: tasksLoading, refetch: refetchTasks } = useStaffTasks()

  const isLoading = eventsLoading || horsesLoading || staffLoading || tasksLoading

  // BREADCRUMB: Filter events by selected staff member
  const filteredEvents = useMemo(() => {
    if (!selectedStaffId) return events
    return events.filter((event) => event.assignedTo.includes(selectedStaffId))
  }, [events, selectedStaffId])

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

  // BREADCRUMB: Handler for week overview cell click - opens task assign sheet
  const handleWeekCellClick = (staffId: string, date: Date) => {
    const member = staff.find((s) => s.id === staffId)
    if (member && canEdit) {
      setModalState({ type: "task", staffId, staffName: member.fullName, date })
    }
  }

  const handleTaskSuccess = () => {
    refetchTasks()
    refetch()
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
                onClick={() => { setViewMode(mode); setShowWeekOverview(false) }}
                className={`px-4 py-2 text-sm font-medium capitalize ${
                  viewMode === mode && !showWeekOverview
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
            <button
              onClick={() => setShowWeekOverview(!showWeekOverview)}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-1 ${
                showWeekOverview
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              Tasks
            </button>
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

      {/* Staff Filter Bar */}
      {staff.length > 0 && (
        <div className="p-3 rounded-lg" style={{ backgroundColor: "#1A1A2E" }}>
          <p className="text-xs text-gray-500 mb-2">Filter by staff member</p>
          <StaffFilterBar
            staff={staff}
            selectedStaffId={selectedStaffId}
            onSelectStaff={setSelectedStaffId}
          />
        </div>
      )}

      {/* Category Legend */}
      {!showWeekOverview && (
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
      )}

      {/* Week Overview or Calendar View */}
      {showWeekOverview ? (
        <WeekOverview
          staff={staff}
          tasks={tasks}
          currentDate={currentDate}
          onCellClick={handleWeekCellClick}
        />
      ) : (
        <CalendarView
          events={filteredEvents}
          viewMode={viewMode}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onEventClick={handleEventClick}
          onDayClick={handleDayClick}
        />
      )}

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

      {/* Task Assign Sheet */}
      {modalState?.type === "task" && (
        <TaskAssignSheet
          memberId={modalState.staffId}
          memberName={modalState.staffName}
          horses={horses}
          initialDate={modalState.date}
          createCalendarEvent
          onClose={() => setModalState(null)}
          onSuccess={handleTaskSuccess}
        />
      )}
    </div>
  )
}
