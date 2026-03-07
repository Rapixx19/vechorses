/**
 * FILE: modules/dashboard/hooks/useTimeOfDay.ts
 * ZONE: Green
 * PURPOSE: Hook to determine time of day for theming
 * EXPORTS: useTimeOfDay, TimeOfDay
 * DEPENDS ON: None
 * CONSUMED BY: DashboardPage
 * TESTS: modules/dashboard/tests/useTimeOfDay.test.ts
 * LAST CHANGED: 2026-03-07 — Initial creation for time-based theming
 */

import { useState, useEffect } from "react"

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night"

// BREADCRUMB: Color schemes for different times of day
export const TIME_COLORS: Record<TimeOfDay, { accent: string; gradient: string }> = {
  morning: { accent: "#F59E0B", gradient: "from-amber-900/20 to-transparent" },
  afternoon: { accent: "#2C5F2E", gradient: "from-green-900/20 to-transparent" },
  evening: { accent: "#0891B2", gradient: "from-cyan-900/20 to-transparent" },
  night: { accent: "#7C3AED", gradient: "from-purple-900/20 to-transparent" },
}

export const TIME_GREETINGS: Record<TimeOfDay, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  night: "Good night",
}

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 12) return "morning"
  if (hour >= 12 && hour < 17) return "afternoon"
  if (hour >= 17 && hour < 22) return "evening"
  return "night"
}

export function useTimeOfDay(): { timeOfDay: TimeOfDay; greeting: string; colors: typeof TIME_COLORS[TimeOfDay] } {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay(new Date().getHours()))

  useEffect(() => {
    const checkTime = () => {
      const newTimeOfDay = getTimeOfDay(new Date().getHours())
      if (newTimeOfDay !== timeOfDay) {
        setTimeOfDay(newTimeOfDay)
      }
    }

    // Check every minute
    const interval = setInterval(checkTime, 60000)
    return () => clearInterval(interval)
  }, [timeOfDay])

  return {
    timeOfDay,
    greeting: TIME_GREETINGS[timeOfDay],
    colors: TIME_COLORS[timeOfDay],
  }
}
