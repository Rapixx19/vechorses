/**
 * FILE: modules/dashboard/index.ts
 * ZONE: Green
 * PURPOSE: Public API for the dashboard module
 * EXPORTS: Dashboard components and re-exports from other modules
 * DEPENDS ON: ./components/*, ./hooks/*, modules/horses, modules/clients, modules/stalls, modules/billing
 * CONSUMED BY: app/dashboard/*
 * TESTS: modules/dashboard/tests/
 * LAST CHANGED: 2026-03-07 — Added lively dashboard components
 */

// BREADCRUMB: Dashboard reads from all modules via their index.ts exports
// Re-export hooks that dashboard needs for its overview
export { useHorses, useTasks } from "@/modules/horses"
export { useClients } from "@/modules/clients"
export { useStalls } from "@/modules/stalls"
export { useBilling } from "@/modules/billing"

// Dashboard hooks
export { useTimeOfDay } from "./hooks/useTimeOfDay"

// Legacy dashboard components
export { StatCard } from "./components/StatCard"
export { TaskChecklist } from "./components/TaskChecklist"
export { OccupancyBar } from "./components/OccupancyBar"
export { RecentBilling } from "./components/RecentBilling"
export { OverdueTasks } from "./components/OverdueTasks"
export { StaffToday } from "./components/StaffToday"

// Lively dashboard components
export { AnimatedStatCard } from "./components/AnimatedStatCard"
export { StatusBanner } from "./components/StatusBanner"
export { QuickActions } from "./components/QuickActions"
export { TodaysSchedule } from "./components/TodaysSchedule"
export { StaffStatusWidget } from "./components/StaffStatusWidget"
export { HorsesGlance } from "./components/HorsesGlance"
export { RecentActivityFeed } from "./components/RecentActivityFeed"
