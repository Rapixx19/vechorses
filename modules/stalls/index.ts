/**
 * FILE: modules/stalls/index.ts
 * ZONE: Green
 * PURPOSE: Public API for the stalls module
 * EXPORTS: useStalls, useStableLayout, StallGrid, StallSheet, AssignHorseSheet, etc.
 * DEPENDS ON: ./hooks/*, ./components/*
 * CONSUMED BY: app/stalls/*, modules/dashboard
 * TESTS: modules/stalls/tests/
 * LAST CHANGED: 2026-03-07 — Added floor plan builder components and hooks
 */

// BREADCRUMB: Module boundary — only export from here, never import subfolders directly

// Hooks
export { useStalls, useAddStall, useUpdateStall, useDeleteStall, type AddStallInput } from "./hooks/useStalls"
export { useStableLayout } from "./hooks/useStableLayout"

// Components
export { StallCell } from "./components/StallCell"
export { StallCard } from "./components/StallCard"
export { StallGrid } from "./components/StallGrid"
export { StallSheet } from "./components/StallSheet"
export { AssignHorseSheet } from "./components/AssignHorseSheet"
export { StallSummary } from "./components/StallSummary"
export { StableStatsBar } from "./components/StableStatsBar"
export { StableBuilder } from "./components/StableBuilder"
export { GridCell } from "./components/GridCell"
export { GridControls } from "./components/GridControls"
export { LayoutToolbar } from "./components/LayoutToolbar"
export { FloorPlanCanvas } from "./components/FloorPlanCanvas"
export { FloorPlanView } from "./components/FloorPlanView"
export { MobileStallList } from "./components/MobileStallList"
