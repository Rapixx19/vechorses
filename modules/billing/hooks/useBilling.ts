/**
 * FILE: modules/billing/hooks/useBilling.ts
 * ZONE: Red
 * PURPOSE: Hook to fetch billing line items (read-only)
 * EXPORTS: useBilling
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: modules/billing/components/*, modules/dashboard/*, app/billing/*
 * TESTS: modules/billing/tests/useBilling.test.ts
 * LAST CHANGED: 2026-03-07 — Removed mock data, returns empty array until V2 Supabase integration
 */

// 🔴 RED ZONE — do not edit without human approval
// Billing data is written by external freelancer, we only read

import type { BillingLineItem } from "@/lib/types"

// BREADCRUMB: Returns empty array until V2 Supabase integration.
// Freelancer writes to billing_line_items table, we only read.
// Never modify billing schema without telling freelancer.
export function useBilling(): BillingLineItem[] {
  return []
}
