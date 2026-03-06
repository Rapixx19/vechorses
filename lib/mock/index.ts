/**
 * FILE: lib/mock/index.ts
 * ZONE: Yellow
 * PURPOSE: Re-export all mock data for V1
 * EXPORTS: mockClients, mockHorses, mockStalls, mockTasks, mockBillingLineItems
 * DEPENDS ON: ./clients, ./horses, ./stalls, ./tasks, ./billing
 * CONSUMED BY: All module hooks
 * TESTS: None (re-export only)
 * LAST CHANGED: 2026-03-05 — Created as central mock data export
 */

export { mockClients } from "./clients"
export { mockHorses } from "./horses"
export { mockStalls } from "./stalls"
export { mockTasks } from "./tasks"
export { mockBillingLineItems } from "./billing"
