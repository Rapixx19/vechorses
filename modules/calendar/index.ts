/**
 * FILE: modules/calendar/index.ts
 * ZONE: Green
 * PURPOSE: Public API for the calendar module
 * EXPORTS: useCalendar, CalendarPage, CalendarView, EventForm, EventDetail
 * DEPENDS ON: ./hooks/*, ./components/*
 * CONSUMED BY: app/calendar/*
 * TESTS: modules/calendar/tests/
 * LAST CHANGED: 2026-03-07 — Initial creation for calendar page
 */

// BREADCRUMB: Module boundary — only export from here, never import subfolders directly

// Hooks
export {
  useCalendar,
  useAddEvent,
  useUpdateEvent,
  useDeleteEvent,
  type AddEventInput,
} from "./hooks/useCalendar"

// Components
export { CalendarPage } from "./components/CalendarPage"
export { CalendarView } from "./components/CalendarView"
export { EventForm } from "./components/EventForm"
export { EventDetail } from "./components/EventDetail"
export { StaffFilterBar } from "./components/StaffFilterBar"
export { WeekOverview } from "./components/WeekOverview"
