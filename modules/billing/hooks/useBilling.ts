/**
 * FILE: modules/billing/hooks/useBilling.ts
 * ZONE: Red
 * PURPOSE: Hook to fetch billing line items (read-only)
 * EXPORTS: useBilling
 * DEPENDS ON: lib/mock-data.ts, lib/types.ts
 * CONSUMED BY: modules/billing/components/*, modules/dashboard/*, app/billing/*
 * TESTS: modules/billing/tests/useBilling.test.ts
 * LAST CHANGED: 2026-03-05 — Initial creation with mock data
 */

// 🔴 RED ZONE — do not edit without human approval
// Billing data is written by external freelancer, we only read

import { mockBillingLineItems } from "@/lib/mock"
import type { BillingLineItem } from "@/lib/types"

// BREADCRUMB: V1 returns mock data. V2 will read from Supabase billing_line_items table.
// Freelancer writes to this table, we only read. Never modify billing schema without telling freelancer.
export function useBilling(): BillingLineItem[] {
  return mockBillingLineItems
}
