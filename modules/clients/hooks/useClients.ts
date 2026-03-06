/**
 * FILE: modules/clients/hooks/useClients.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch all active clients from mock data
 * EXPORTS: useClients
 * DEPENDS ON: lib/mock-data.ts, lib/types.ts
 * CONSUMED BY: modules/clients/components/*, app/clients/*
 * TESTS: modules/clients/tests/useClients.test.ts
 * LAST CHANGED: 2026-03-05 — Initial creation with mock data
 */

import { mockClients } from "@/lib/mock"
import type { Client } from "@/lib/types"

// BREADCRUMB: V1 returns mock data. V2 will swap internals to Supabase query.
export function useClients(): Client[] {
  return mockClients.filter((client) => client.isActive)
}
