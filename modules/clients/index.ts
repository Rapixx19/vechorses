/**
 * FILE: modules/clients/index.ts
 * ZONE: Green
 * PURPOSE: Public API for the clients module
 * EXPORTS: useClients
 * DEPENDS ON: ./hooks/useClients
 * CONSUMED BY: app/clients/*, modules/dashboard
 * TESTS: modules/clients/tests/
 * LAST CHANGED: 2026-03-05 — Added hook exports
 */

// BREADCRUMB: Module boundary — only export from here, never import subfolders directly

export { useClients } from "./hooks/useClients"
