/**
 * FILE: modules/documents/index.ts
 * ZONE: Green
 * PURPOSE: Public API for the documents module
 * EXPORTS: DocumentsPage, DocumentUploadSheet, DocumentDetailSheet, BulkUploadSheet, useDocuments, useAddDocument, useUpdateDocument, useDeleteDocument
 * DEPENDS ON: ./components/*, ./hooks/*
 * CONSUMED BY: app/documents/*, app/api/analyse-document/*
 * TESTS: modules/documents/tests/
 * LAST CHANGED: 2026-03-07 — Added all component and hook exports
 */

// Components
export { DocumentsPage } from "./components/DocumentsPage"
export { DocumentUploadSheet } from "./components/DocumentUploadSheet"
export { DocumentDetailSheet } from "./components/DocumentDetailSheet"
export { BulkUploadSheet } from "./components/BulkUploadSheet"

// Hooks
export {
  useDocuments,
  useAddDocument,
  useUpdateDocument,
  useDeleteDocument,
  CATEGORY_GROUPS,
  type CategoryGroup,
  type AddDocumentInput,
} from "./hooks/useDocuments"
