/**
 * FILE: modules/clients/components/ClientDocumentUpload.tsx
 * ZONE: Green
 * PURPOSE: Upload area for client documents (V1 mock)
 * EXPORTS: ClientDocumentUpload
 * DEPENDS ON: lucide-react
 * CONSUMED BY: ClientDetail
 * TESTS: modules/clients/tests/ClientDocumentUpload.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

"use client"

import { Upload } from "lucide-react"

export function ClientDocumentUpload() {
  const handleClick = () => {
    // BREADCRUMB: V1 mock - show toast. Real upload via Supabase Storage in V2.
    alert("Document upload available in V2")
  }

  return (
    <button
      onClick={handleClick}
      className="w-full border-2 border-dashed border-[var(--border)] rounded-lg p-6 flex flex-col items-center gap-2 hover:border-[#2C5F2E]/50 transition-colors"
    >
      <Upload className="h-8 w-8 text-[var(--text-muted)]" />
      <span className="text-sm text-[var(--text-muted)]">
        Upload documents — contracts, waivers, PDFs
      </span>
    </button>
  )
}
