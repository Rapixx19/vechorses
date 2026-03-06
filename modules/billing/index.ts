/**
 * FILE: modules/billing/index.ts
 * ZONE: 🔴 Red
 * PURPOSE: Public API for the billing module (Red Zone - isolated)
 * EXPORTS: useBilling, BillingStats, BillingFilters, BillingFilterState, BillingTable, BillingItemSheet, NewBillingItemForm, MonthlyRevenueSummary, PaymentStatusBar, ClientBillingCard
 * DEPENDS ON: ./hooks/useBilling, ./components/*
 * CONSUMED BY: app/billing/*, modules/dashboard (read-only)
 * TESTS: modules/billing/tests/
 * LAST CHANGED: 2026-03-06 — Added client-centric billing components
 */

// 🔴 RED ZONE — billing module is isolated, never pass PII here, only client_id
// Freelancer writes to billing_line_items table, we read only

export { useBilling } from "./hooks/useBilling"
export { BillingStats } from "./components/BillingStats"
export { BillingFilters } from "./components/BillingFilters"
export type { BillingFilterState } from "./components/BillingFilters"
export { BillingTable } from "./components/BillingTable"
export { BillingItemSheet } from "./components/BillingItemSheet"
export { NewBillingItemForm } from "./components/NewBillingItemForm"
export { MonthlyRevenueSummary } from "./components/MonthlyRevenueSummary"
export { PaymentStatusBar } from "./components/PaymentStatusBar"
export { ClientBillingCard } from "./components/ClientBillingCard"
