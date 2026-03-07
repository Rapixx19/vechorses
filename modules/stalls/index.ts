/**
 * FILE: modules/stalls/index.ts
 * ZONE: Green
 * PURPOSE: Public API for the stalls module
 * EXPORTS: useStalls, StallCell, StallGrid, StallSheet, AssignHorseSheet, StallSummary
 * DEPENDS ON: ./hooks/useStalls, ./components/*
 * CONSUMED BY: app/stalls/*, modules/dashboard
 * TESTS: modules/stalls/tests/
 * LAST CHANGED: 2026-03-06 — Replaced StallPopover with StallSheet
 */

// BREADCRUMB: Module boundary — only export from here, never import subfolders directly

export { useStalls, useAddStall, type AddStallInput } from "./hooks/useStalls"
export { StallCell } from "./components/StallCell"
export { StallGrid } from "./components/StallGrid"
export { StallSheet } from "./components/StallSheet"
export { AssignHorseSheet } from "./components/AssignHorseSheet"
export { StallSummary } from "./components/StallSummary"
