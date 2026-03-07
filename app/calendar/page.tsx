/**
 * FILE: app/calendar/page.tsx
 * ZONE: Green
 * PURPOSE: Calendar page route
 * EXPORTS: default (CalendarPageRoute)
 * DEPENDS ON: modules/calendar
 * CONSUMED BY: Next.js routing
 * TESTS: app/calendar/page.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for calendar page
 */

import { CalendarPage } from "@/modules/calendar"

export default function CalendarPageRoute() {
  return <CalendarPage />
}
