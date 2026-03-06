/**
 * FILE: modules/horses/hooks/useHorses.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch all active horses from mock data
 * EXPORTS: useHorses
 * DEPENDS ON: lib/mock-data.ts, lib/types.ts
 * CONSUMED BY: modules/horses/components/*, app/horses/*
 * TESTS: modules/horses/tests/useHorses.test.ts
 * LAST CHANGED: 2026-03-05 — Initial creation with mock data
 */

import { mockHorses } from "@/lib/mock"
import type { Horse } from "@/lib/types"

// BREADCRUMB: V1 returns mock data. V2 will swap internals to Supabase query.
export function useHorses(): Horse[] {
  return mockHorses.filter((horse) => horse.isActive)
}
