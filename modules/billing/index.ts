/**
 * FILE: modules/billing/index.ts
 * ZONE: Red
 * PURPOSE: Public API for the billing module (Red Zone - isolated)
 * EXPORTS: All public components, hooks, and types from this module
 * DEPENDS ON: ./components, ./hooks
 * CONSUMED BY: app/billing/*, modules/dashboard (read-only)
 * TESTS: modules/billing/tests/
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

// BREADCRUMB: RED ZONE — billing module is isolated, never pass PII here, only client_id
// Freelancer writes to billing_line_items table, we read only
