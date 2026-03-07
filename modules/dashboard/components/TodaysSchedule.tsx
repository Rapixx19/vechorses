/**
 * FILE: modules/dashboard/components/TodaysSchedule.tsx
 * ZONE: Green
 * PURPOSE: Timeline of today's calendar events
 * EXPORTS: TodaysSchedule
 * DEPENDS ON: framer-motion, lucide-react
 * CONSUMED BY: DashboardPage
 * TESTS: modules/dashboard/tests/TodaysSchedule.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for lively dashboard
 */

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, Plus } from "lucide-react"
import type { CalendarEvent } from "@/lib/types"

interface TodaysScheduleProps {
  events: CalendarEvent[]
}

// BREADCRUMB: Format time for display
function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export function TodaysSchedule({ events }: TodaysScheduleProps) {
  // Filter to today's events and sort by start time
  const today = new Date().toISOString().split("T")[0]
  const todaysEvents = events
    .filter((e) => e.startTime.startsWith(today))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-lg border border-[var(--border)] bg-[#1A1A2E]/50 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#2C5F2E]" />
          <h3 className="text-sm font-medium text-white">Today&apos;s Schedule</h3>
        </div>
        <Link href="/calendar" className="text-xs text-gray-400 hover:text-white">
          View all
        </Link>
      </div>

      {todaysEvents.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm mb-3">No events today</p>
          <Link
            href="/calendar"
            className="inline-flex items-center gap-1 text-xs text-[#2C5F2E] hover:text-green-400"
          >
            <Plus className="h-3 w-3" />
            Add event
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {todaysEvents.slice(0, 5).map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * i }}
              className="flex items-center gap-3"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{event.title}</p>
                <p className="text-xs text-gray-500">
                  {event.allDay ? "All day" : formatTime(event.startTime)}
                </p>
              </div>
            </motion.div>
          ))}
          {todaysEvents.length > 5 && (
            <p className="text-xs text-gray-500 text-center">
              +{todaysEvents.length - 5} more events
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}
