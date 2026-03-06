/**
 * FILE: modules/horses/components/DocumentList.tsx
 * ZONE: Green
 * PURPOSE: Display list of horse documents with type badges
 * EXPORTS: DocumentList
 * DEPENDS ON: useDocuments, lucide-react
 * CONSUMED BY: HorseDetail (Documents tab)
 * TESTS: modules/horses/tests/DocumentList.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

"use client"

import { FileText, Download } from "lucide-react"
import { useDocuments } from "@/modules/horses"

interface DocumentListProps {
  horseId: string
}

// BREADCRUMB: Type badge colors for document categories
const typeColors: Record<string, string> = {
  vaccination: "border-green-600/50 text-green-400/80",
  passport: "border-blue-600/50 text-blue-400/80",
  insurance: "border-purple-600/50 text-purple-400/80",
  vet_report: "border-amber-600/50 text-amber-400/80",
  other: "border-gray-500/50 text-gray-400/80",
}

const typeLabels: Record<string, string> = {
  vaccination: "Vaccination",
  passport: "Passport",
  insurance: "Insurance",
  vet_report: "Vet Report",
  other: "Other",
}

export function DocumentList({ horseId }: DocumentListProps) {
  const documents = useDocuments(horseId)

  const handleDownload = () => {
    alert("Document download available in V2")
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[var(--text-muted)]">No documents uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center gap-3 px-3 py-2 rounded-md border border-[var(--border)] hover:bg-[#1A1A2E]/50">
          <FileText className="h-5 w-5 text-[var(--text-muted)] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--text-primary)] truncate">{doc.name}</p>
            {doc.notes && <p className="text-xs text-[var(--text-muted)] truncate">{doc.notes}</p>}
          </div>
          <span className={`px-2 py-0.5 rounded border text-[10px] flex-shrink-0 ${typeColors[doc.type]}`}>
            {typeLabels[doc.type]}
          </span>
          <span className="text-xs text-[var(--text-muted)] flex-shrink-0 w-16 text-right">{doc.fileSize}</span>
          <span className="text-xs text-[var(--text-muted)] flex-shrink-0 w-20">{formatDate(doc.uploadedAt)}</span>
          <button onClick={handleDownload} className="p-1 text-[var(--text-muted)] hover:text-[#2C5F2E]">
            <Download className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
