/**
 * FILE: modules/stalls/index.ts
 * ZONE: Green
 * PURPOSE: Public API for the stalls module
 * EXPORTS: useStalls
 * DEPENDS ON: ./hooks/useStalls
 * CONSUMED BY: app/stalls/*, modules/dashboard
 * TESTS: modules/stalls/tests/
 * LAST CHANGED: 2026-03-05 — Added hook exports
 */

// BREADCRUMB: Module boundary — only export from here, never import subfolders directly

export { useStalls } from "./hooks/useStalls"
