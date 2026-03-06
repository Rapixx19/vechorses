/**
 * FILE: modules/services/index.ts
 * ZONE: Yellow
 * PURPOSE: Public API for services module
 * EXPORTS: ServiceGrid, ServiceCard, ServiceForm, PdfImporter, useServices, useServicesByCategory, useAddService, useUpdateService, useDeleteService
 * DEPENDS ON: ./components/*, ./hooks/*
 * CONSUMED BY: app/services/page.tsx, modules/billing
 * TESTS: None (re-export only)
 * LAST CHANGED: 2026-03-06 — Initial creation for service management
 */

// Components
export { ServiceGrid } from "./components/ServiceGrid"
export { ServiceCard } from "./components/ServiceCard"
export { ServiceForm } from "./components/ServiceForm"
export { PdfImporter } from "./components/PdfImporter"

// Hooks
export { useServices, useServicesByCategory, useAddService, useUpdateService, useDeleteService } from "./hooks/useServices"
