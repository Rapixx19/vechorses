/**
 * FILE: modules/clients/index.ts
 * ZONE: Green
 * PURPOSE: Public API for the clients module
 * EXPORTS: useClients, useClientDocuments, ClientCard, ClientList, ClientOverviewTab, ClientHorses, ClientDetail, ClientForm, ClientDocumentList, ClientDocumentUpload, ClientBillingHistory
 * DEPENDS ON: ./hooks/*, ./components/*
 * CONSUMED BY: app/clients/*, modules/dashboard
 * TESTS: modules/clients/tests/
 * LAST CHANGED: 2026-03-06 — Added documents and billing history components
 */

// BREADCRUMB: Module boundary — only export from here, never import subfolders directly

export { useClients, useCreateClient, type CreateClientInput } from "./hooks/useClients"
export { useClientDocuments } from "./hooks/useClientDocuments"
export { ClientCard } from "./components/ClientCard"
export { ClientList } from "./components/ClientList"
export { ClientOverviewTab } from "./components/ClientOverviewTab"
export { ClientHorses } from "./components/ClientHorses"
export { ClientDetail } from "./components/ClientDetail"
export { ClientForm } from "./components/ClientForm"
export { ClientDocumentList } from "./components/ClientDocumentList"
export { ClientDocumentUpload } from "./components/ClientDocumentUpload"
export { ClientBillingHistory } from "./components/ClientBillingHistory"

// Page components
export { NewClientPage } from "./components/NewClientPage"
export { EditClientPage } from "./components/EditClientPage"
