/**
 * FILE: app/documents/page.tsx
 * ZONE: Green
 * PURPOSE: Documents page route
 * EXPORTS: default (DocumentsPageRoute)
 * DEPENDS ON: modules/documents
 * CONSUMED BY: Next.js routing
 * TESTS: app/documents/page.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation
 */

import { DocumentsPage } from "@/modules/documents"

export default function DocumentsPageRoute() {
  return <DocumentsPage />
}
