/**
 * FILE: modules/horses/index.ts
 * ZONE: Green
 * PURPOSE: Public API for the horses module
 * EXPORTS: useHorses, useTasks, useDocuments, HorseCard, HorseList, HorseDetail, HorseForm, HorsePhotos, DocumentList, DocumentUpload
 * DEPENDS ON: ./hooks/*, ./components/*
 * CONSUMED BY: app/horses/*, modules/dashboard
 * TESTS: modules/horses/tests/
 * LAST CHANGED: 2026-03-06 — Added photo and document exports
 */

// BREADCRUMB: Module boundary — only export from here, never import subfolders directly

// Hooks
export { useHorses, useCreateHorse, type CreateHorseInput } from "./hooks/useHorses"
export { useTasks } from "./hooks/useTasks"
export { useDocuments } from "./hooks/useDocuments"

// Components
export { HorseCard } from "./components/HorseCard"
export { HorseList } from "./components/HorseList"
export { HorseDetail } from "./components/HorseDetail"
export { HorseForm } from "./components/HorseForm"
export { HorsePhotos } from "./components/HorsePhotos"
export { HorseOverviewTab } from "./components/HorseOverviewTab"
export { DocumentList } from "./components/DocumentList"
export { DocumentUpload } from "./components/DocumentUpload"

// Page components
export { NewHorsePage } from "./components/NewHorsePage"
export { EditHorsePage } from "./components/EditHorsePage"
