/**
 * FILE: modules/dashboard/index.ts
 * ZONE: Green
 * PURPOSE: Public API for the dashboard module
 * EXPORTS: Re-exports from other modules for dashboard use
 * DEPENDS ON: modules/horses, modules/clients, modules/stalls, modules/billing
 * CONSUMED BY: app/dashboard/*
 * TESTS: modules/dashboard/tests/
 * LAST CHANGED: 2026-03-05 — Added re-exports for dashboard consumption
 */

// BREADCRUMB: Dashboard reads from all modules via their index.ts exports
// Re-export hooks that dashboard needs for its overview

export { useHorses, useTasks } from "@/modules/horses"
export { useClients } from "@/modules/clients"
export { useStalls } from "@/modules/stalls"
export { useBilling } from "@/modules/billing"
