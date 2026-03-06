/**
 * FILE: modules/clients/hooks/useClientDocuments.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch client documents filtered by clientId
 * EXPORTS: useClientDocuments
 * DEPENDS ON: lib/mock/clientDocuments.ts, lib/types.ts
 * CONSUMED BY: ClientDocumentList, ClientDetail
 * TESTS: modules/clients/tests/useClientDocuments.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

import { mockClientDocuments } from "@/lib/mock"
import type { ClientDocument } from "@/lib/types"

// BREADCRUMB: V1 returns mock data filtered by clientId. V2 will fetch from Supabase.
export function useClientDocuments(clientId: string): ClientDocument[] {
  return mockClientDocuments.filter((doc) => doc.clientId === clientId)
}
