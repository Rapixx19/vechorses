/**
 * FILE: modules/horses/index.ts
 * ZONE: Green
 * PURPOSE: Public API for the horses module
 * EXPORTS: useHorses, useTasks
 * DEPENDS ON: ./hooks/useHorses, ./hooks/useTasks
 * CONSUMED BY: app/horses/*, modules/dashboard
 * TESTS: modules/horses/tests/
 * LAST CHANGED: 2026-03-05 — Added hook exports
 */

// BREADCRUMB: Module boundary — only export from here, never import subfolders directly

export { useHorses } from "./hooks/useHorses"
export { useTasks } from "./hooks/useTasks"
