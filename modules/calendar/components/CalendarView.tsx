/**
 * FILE: modules/calendar/components/CalendarView.tsx
 * ZONE: Green
 * PURPOSE: Calendar grid views (month, week, day) with event display
 * EXPORTS: CalendarView
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: CalendarPage
 * TESTS: modules/calendar/tests/CalendarView.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for calendar page
 */

"use client"

import { useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { CalendarEvent, CalendarViewMode } from "@/lib/types"

interface CalendarViewProps {
  events: CalendarEvent[]
  viewMode: CalendarViewMode
  currentDate: Date
  onDateChange: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
  onDayClick: (date: Date) => void
}

// BREADCRUMB: Category colors
const CATEGORY_COLORS: Record<string, string> = {
  general: "#2C5F2E",
  vet: "#ef4444",
  farrier: "#f97316",
  competition: "#3b82f6",
  training: "#8b5cf6",
  feeding: "#eab308",
  vacation: "#14b8a6",
  meeting: "#6366f1",
}

// BREADCRUMB: Helper to get days in month grid (includes prev/next month days)
function getMonthDays(date: Date): Date[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay() // 0 = Sunday
  const days: Date[] = []

  // Add previous month days
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i))
  }

  // Add current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  // Add next month days to complete 6 weeks
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
}

// BREADCRUMB: Helper to get week days
function getWeekDays(date: Date): Date[] {
  const days: Date[] = []
  const start = new Date(date)
  start.setDate(start.getDate() - start.getDay()) // Start from Sunday

  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    days.push(day)
  }

  return days
}

// BREADCRUMB: Helper to get events for a specific date
function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dateStr = date.toISOString().split("T")[0]
  return events.filter((e) => {
    const eventDate = new Date(e.startTime).toISOString().split("T")[0]
    return eventDate === dateStr
  })
}

// BREADCRUMB: Hour slots for day/week view
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function CalendarView({
  events,
  viewMode,
  currentDate,
  onDateChange,
  onEventClick,
  onDayClick,
}: CalendarViewProps) {
  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate])
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])
  const today = new Date().toISOString().split("T")[0]

  const navigatePrev = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    onDateChange(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    onDateChange(newDate)
  }

  const goToToday = () => onDateChange(new Date())

  const headerLabel = viewMode === "month"
    ? currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : viewMode === "week"
    ? `Week of ${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={navigatePrev}
            className="p-2 rounded hover:bg-gray-700"
          >
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </button>
          <button
            onClick={navigateNext}
            className="p-2 rounded hover:bg-gray-700"
          >
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
          <h2 className="text-lg font-semibold text-white ml-2">{headerLabel}</h2>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-1 rounded text-sm bg-gray-700 text-white hover:bg-gray-600"
        >
          Today
        </button>
      </div>

      {/* Month View */}
      {viewMode === "month" && (
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#2a2a3e]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center text-xs font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {monthDays.map((day, idx) => {
              const dateStr = day.toISOString().split("T")[0]
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const isToday = dateStr === today
              const dayEvents = getEventsForDate(events, day)

              return (
                <div
                  key={idx}
                  onClick={() => onDayClick(day)}
                  className={`
                    min-h-[100px] p-1 border-b border-r border-[#2a2a3e] cursor-pointer
                    hover:bg-gray-700/30 transition-colors
                    ${!isCurrentMonth ? "opacity-40" : ""}
                  `}
                >
                  <div className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1
                    ${isToday ? "bg-green-600 text-white" : "text-gray-300"}
                  `}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event) }}
                        className="text-[10px] px-1 py-0.5 rounded truncate text-white"
                        style={{ backgroundColor: event.color || CATEGORY_COLORS[event.category] }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-400 px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === "week" && (
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b border-[#2a2a3e]">
            <div className="p-2 text-xs text-gray-500" />
            {weekDays.map((day) => {
              const dateStr = day.toISOString().split("T")[0]
              const isToday = dateStr === today
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 text-center ${isToday ? "bg-green-600/20" : ""}`}
                >
                  <div className="text-xs text-gray-400">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className={`text-lg font-semibold ${isToday ? "text-green-400" : "text-white"}`}>
                    {day.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Time slots */}
          <div className="max-h-[600px] overflow-y-auto">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-[#2a2a3e]/50">
                <div className="p-1 text-[10px] text-gray-500 text-right pr-2">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                {weekDays.map((day) => {
                  const dayEvents = getEventsForDate(events, day).filter((e) => {
                    const eventHour = new Date(e.startTime).getHours()
                    return eventHour === hour
                  })
                  return (
                    <div
                      key={day.toISOString()}
                      className="min-h-[40px] border-l border-[#2a2a3e]/50 p-0.5"
                    >
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          className="text-[10px] px-1 py-0.5 rounded truncate text-white cursor-pointer"
                          style={{ backgroundColor: event.color || CATEGORY_COLORS[event.category] }}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === "day" && (
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
          <div className="max-h-[600px] overflow-y-auto">
            {HOURS.map((hour) => {
              const hourEvents = getEventsForDate(events, currentDate).filter((e) => {
                const eventHour = new Date(e.startTime).getHours()
                return eventHour === hour
              })
              return (
                <div key={hour} className="flex border-b border-[#2a2a3e]/50">
                  <div className="w-16 p-2 text-sm text-gray-500 text-right flex-shrink-0">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                  <div className="flex-1 min-h-[60px] p-1 border-l border-[#2a2a3e]">
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="px-3 py-2 rounded text-sm text-white cursor-pointer mb-1"
                        style={{ backgroundColor: event.color || CATEGORY_COLORS[event.category] }}
                      >
                        <div className="font-medium">{event.title}</div>
                        {event.location && (
                          <div className="text-xs opacity-80">{event.location}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
