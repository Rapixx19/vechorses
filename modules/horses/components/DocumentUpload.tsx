/**
 * FILE: modules/horses/components/DocumentUpload.tsx
 * ZONE: Green
 * PURPOSE: Upload area for horse documents (UI only in V1)
 * EXPORTS: DocumentUpload
 * DEPENDS ON: lucide-react
 * CONSUMED BY: HorseDetail (Documents tab)
 * TESTS: modules/horses/tests/DocumentUpload.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

"use client"

import { Upload } from "lucide-react"

export function DocumentUpload() {
  const handleUpload = () => {
    alert("Document upload available in V2")
  }

  return (
    <button
      onClick={handleUpload}
      className="w-full py-6 rounded-md border-2 border-dashed border-[var(--border)] flex flex-col items-center gap-2 text-[var(--text-muted)] hover:border-[#2C5F2E] hover:text-[#2C5F2E] transition-colors"
    >
      <Upload className="h-6 w-6" />
      <span className="text-sm">Upload documents — PDF, images supported</span>
      <span className="text-xs">Click or drag to upload</span>
    </button>
  )
}
