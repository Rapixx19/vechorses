/**
 * FILE: modules/horses/index.ts
 * ZONE: Green
 * PURPOSE: Public API for the horses module
 * EXPORTS: useHorses, useTasks, HorseCard, HorseList, HorseDetail, HorseForm
 * DEPENDS ON: ./hooks/*, ./components/*
 * CONSUMED BY: app/horses/*, modules/dashboard
 * TESTS: modules/horses/tests/
 * LAST CHANGED: 2026-03-06 — Added component exports
 */

// BREADCRUMB: Module boundary — only export from here, never import subfolders directly

// Hooks
export { useHorses } from "./hooks/useHorses"
export { useTasks } from "./hooks/useTasks"

// Components
export { HorseCard } from "./components/HorseCard"
export { HorseList } from "./components/HorseList"
export { HorseDetail } from "./components/HorseDetail"
export { HorseForm } from "./components/HorseForm"
