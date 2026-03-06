/**
 * FILE: modules/clients/components/ClientDocumentList.tsx
 * ZONE: Green
 * PURPOSE: Displays list of documents for a client
 * EXPORTS: ClientDocumentList
 * DEPENDS ON: useClientDocuments, lucide-react
 * CONSUMED BY: ClientDetail
 * TESTS: modules/clients/tests/ClientDocumentList.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

"use client"

import { FileText, Download } from "lucide-react"
import { useClientDocuments } from "../hooks/useClientDocuments"
import type { ClientDocumentType } from "@/lib/types"

interface ClientDocumentListProps {
  clientId: string
}

const typeColors: Record<ClientDocumentType, string> = {
  contract: "border-blue-600/40 text-blue-400",
  waiver: "border-amber-600/40 text-amber-400",
  insurance: "border-green-600/40 text-green-400",
  id_copy: "border-purple-600/40 text-purple-400",
  other: "border-gray-500/40 text-gray-400",
}

const typeLabels: Record<ClientDocumentType, string> = {
  contract: "Contract",
  waiver: "Waiver",
  insurance: "Insurance",
  id_copy: "ID Copy",
  other: "Other",
}

export function ClientDocumentList({ clientId }: ClientDocumentListProps) {
  const documents = useClientDocuments(clientId)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

  if (documents.length === 0) {
    return (
      <p className="text-center py-8 text-sm text-[var(--text-muted)]">
        No documents uploaded yet
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center gap-4 p-3 rounded-md" style={{ backgroundColor: "#1A1A2E" }}>
          <FileText className="h-5 w-5 text-[var(--text-muted)] flex-shrink-0" />
          <span className="flex-1 text-sm text-[var(--text-primary)] truncate">{doc.name}</span>
          <span className={`px-2 py-0.5 rounded border text-[10px] ${typeColors[doc.type]}`}>
            {typeLabels[doc.type]}
          </span>
          <span className="text-xs text-[var(--text-muted)] w-16">{doc.fileSize}</span>
          <span className="text-xs text-[var(--text-muted)] w-20">{formatDate(doc.uploadedAt)}</span>
          <button className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <Download className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
