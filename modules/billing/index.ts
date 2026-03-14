/**
 * FILE: modules/billing/index.ts
 * ZONE: 🔴 Red
 * PURPOSE: Public API for the billing module (Red Zone - isolated)
 * EXPORTS: useBilling, useSettings, useUpdateSettings, useInvoices, useCreateInvoice, useUpdateInvoice, BillingStats, BillingFilters, BillingFilterState, BillingTable, BillingItemSheet, NewBillingItemForm, MonthlyRevenueSummary, PaymentStatusBar, ClientBillingCard, InvoiceBuilder, InvoicePreview, StableInfoForm, BillingSettingsForm, InvoiceHistoryTable
 * DEPENDS ON: ./hooks/*, ./components/*, ./services/*
 * CONSUMED BY: app/billing/*, app/settings/*, modules/dashboard (read-only)
 * TESTS: modules/billing/tests/
 * LAST CHANGED: 2026-03-06 — Added Phase 7b invoice and settings components
 */

// 🔴 RED ZONE — billing module is isolated, never pass PII here, only client_id
// Freelancer writes to billing_line_items table, we read only

// Hooks
export { useBilling } from "./hooks/useBilling"
export { useSettings, useUpdateSettings } from "./hooks/useSettings"
export { useInvoices, useCreateInvoice, useUpdateInvoice } from "./hooks/useInvoices"

// Components - Billing
export { BillingStats } from "./components/BillingStats"
export { BillingFilters } from "./components/BillingFilters"
export type { BillingFilterState } from "./components/BillingFilters"
export { BillingTable } from "./components/BillingTable"
export { BillingItemSheet } from "./components/BillingItemSheet"
export { NewBillingItemForm } from "./components/NewBillingItemForm"
export { MonthlyRevenueSummary } from "./components/MonthlyRevenueSummary"
export { PaymentStatusBar } from "./components/PaymentStatusBar"
export { ClientBillingCard } from "./components/ClientBillingCard"

// Components - Invoice
export { InvoiceBuilder } from "./components/InvoiceBuilder"
export { InvoicePreview } from "./components/InvoicePreview"
export { InvoiceDocument, settingsToStableProp } from "./components/InvoiceDocument"
export type { InvoiceDocumentProps } from "./components/InvoiceDocument"
export { InvoiceLineItemRow } from "./components/InvoiceLineItemRow"
export { SendInvoiceModal } from "./components/SendInvoiceModal"

// Components - Settings
export { StableInfoForm } from "./components/StableInfoForm"
export { BillingSettingsForm } from "./components/BillingSettingsForm"
export { InvoiceHistoryTable } from "./components/InvoiceHistoryTable"

// Services
export { generateInvoicePdf } from "./services/generatePdf"

// Page components
export { BillingPage } from "./components/BillingPage"
