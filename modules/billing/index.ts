/**
 * FILE: modules/billing/index.ts
 * ZONE: Red
 * PURPOSE: Public API for the billing module (Red Zone - isolated)
 * EXPORTS: useBilling
 * DEPENDS ON: ./hooks/useBilling
 * CONSUMED BY: app/billing/*, modules/dashboard (read-only)
 * TESTS: modules/billing/tests/
 * LAST CHANGED: 2026-03-05 — Added hook exports
 */

// 🔴 RED ZONE — billing module is isolated, never pass PII here, only client_id
// Freelancer writes to billing_line_items table, we read only

export { useBilling } from "./hooks/useBilling"
