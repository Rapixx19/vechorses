/**
 * FILE: app/calendar/page.tsx
 * ZONE: Green
 * PURPOSE: Calendar page route with SSR disabled
 * EXPORTS: default (CalendarPageRoute)
 * DEPENDS ON: modules/calendar
 * CONSUMED BY: Next.js routing
 * TESTS: app/calendar/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import dynamic from "next/dynamic"

const CalendarPage = dynamic(
  () => import("@/modules/calendar").then((mod) => mod.CalendarPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function CalendarPageRoute() {
  return <CalendarPage />
}
