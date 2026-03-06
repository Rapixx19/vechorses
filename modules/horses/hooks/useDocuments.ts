/**
 * FILE: modules/horses/hooks/useDocuments.ts
 * ZONE: Yellow
 * PURPOSE: Hook to get documents for a specific horse
 * EXPORTS: useDocuments
 * DEPENDS ON: lib/mock/documents
 * CONSUMED BY: modules/horses/components/DocumentList
 * TESTS: modules/horses/tests/useDocuments.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

import { mockDocuments } from "@/lib/mock"
import type { HorseDocument } from "@/lib/types"

// BREADCRUMB: V1 returns filtered mock data. V2 will fetch from Supabase.
export function useDocuments(horseId: string): HorseDocument[] {
  return mockDocuments.filter((doc) => doc.horseId === horseId)
}
