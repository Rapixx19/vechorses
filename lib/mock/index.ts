/**
 * FILE: lib/mock/index.ts
 * ZONE: Yellow
 * PURPOSE: Re-export all mock data for V1
 * EXPORTS: mockClients, mockHorses, mockStalls, mockTasks, mockBillingLineItems, mockDocuments, mockClientDocuments, mockStableSettings, mockInvoices, mockServices, mockTeamMembers, mockAuthUser, getDefaultPermissions
 * DEPENDS ON: ./clients, ./horses, ./stalls, ./tasks, ./billing, ./documents, ./clientDocuments, ./settings, ./invoices, ./services, ./team, ./auth
 * CONSUMED BY: All module hooks
 * TESTS: None (re-export only)
 * LAST CHANGED: 2026-03-06 — Added team and auth exports
 */

export { mockClients } from "./clients"
export { mockHorses } from "./horses"
export { mockStalls } from "./stalls"
export { mockTasks } from "./tasks"
export { mockBillingLineItems } from "./billing"
export { mockDocuments } from "./documents"
export { mockClientDocuments } from "./clientDocuments"
export { mockStableSettings } from "./settings"
export { mockInvoices } from "./invoices"
export { mockServices } from "./services"
export { mockTeamMembers, getDefaultPermissions } from "./team"
export { mockAuthUser } from "./auth"
