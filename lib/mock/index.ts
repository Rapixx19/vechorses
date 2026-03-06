/**
 * FILE: lib/mock/index.ts
 * ZONE: Yellow
 * PURPOSE: Re-export all mock data for V1
 * EXPORTS: mockClients, mockHorses, mockStalls, mockTasks, mockBillingLineItems, mockDocuments, mockClientDocuments
 * DEPENDS ON: ./clients, ./horses, ./stalls, ./tasks, ./billing, ./documents, ./clientDocuments
 * CONSUMED BY: All module hooks
 * TESTS: None (re-export only)
 * LAST CHANGED: 2026-03-06 — Added mockClientDocuments export
 */

export { mockClients } from "./clients"
export { mockHorses } from "./horses"
export { mockStalls } from "./stalls"
export { mockTasks } from "./tasks"
export { mockBillingLineItems } from "./billing"
export { mockDocuments } from "./documents"
export { mockClientDocuments } from "./clientDocuments"
