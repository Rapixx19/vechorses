/**
 * FILE: modules/stalls/hooks/useStalls.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch all stalls from mock data
 * EXPORTS: useStalls
 * DEPENDS ON: lib/mock-data.ts, lib/types.ts
 * CONSUMED BY: modules/stalls/components/*, app/stalls/*
 * TESTS: modules/stalls/tests/useStalls.test.ts
 * LAST CHANGED: 2026-03-05 — Initial creation with mock data
 */

import { mockStalls } from "@/lib/mock"
import type { Stall } from "@/lib/types"

// BREADCRUMB: V1 returns mock data. V2 will swap internals to Supabase query.
export function useStalls(): Stall[] {
  return mockStalls
}
