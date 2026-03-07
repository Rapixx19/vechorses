/**
 * FILE: modules/documents/components/DocumentsPage.tsx
 * ZONE: Green
 * PURPOSE: Document management page with file upload and organization
 * EXPORTS: DocumentsPage
 * DEPENDS ON: lucide-react, Skeleton
 * CONSUMED BY: app/documents/page.tsx
 * TESTS: modules/documents/tests/DocumentsPage.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for document management
 */

"use client"

import { useState } from "react"
import { FileText, Upload, FolderOpen, Search, Plus } from "lucide-react"
import { Skeleton } from "@/modules/dashboard"

// BREADCRUMB: Placeholder document type until V2 backend
interface Document {
  id: string
  name: string
  type: "contract" | "invoice" | "medical" | "insurance" | "other"
  uploadedAt: string
  size: string
  horseId?: string
  clientId?: string
}

// BREADCRUMB: Mock documents for V1
const mockDocuments: Document[] = [
  { id: "1", name: "Boarding Contract - Thunder.pdf", type: "contract", uploadedAt: "2026-03-01", size: "245 KB", horseId: "h1", clientId: "c1" },
  { id: "2", name: "Vet Report - Storm.pdf", type: "medical", uploadedAt: "2026-02-28", size: "1.2 MB", horseId: "h2" },
  { id: "3", name: "Insurance Policy 2026.pdf", type: "insurance", uploadedAt: "2026-01-15", size: "3.4 MB" },
  { id: "4", name: "Invoice-2026-001.pdf", type: "invoice", uploadedAt: "2026-03-05", size: "89 KB", clientId: "c2" },
]

const typeColors: Record<Document["type"], string> = {
  contract: "badge-blue",
  invoice: "badge-green",
  medical: "badge-red",
  insurance: "badge-purple",
  other: "badge-gray",
}

export function DocumentsPage() {
  const [documents] = useState<Document[]>(mockDocuments)
  const [search, setSearch] = useState("")
  const [isLoading] = useState(false)

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Documents</h1>
        <button className="btn btn-primary">
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-secondary text-xs py-1.5">
          <FolderOpen className="h-3 w-3" />
          All
        </button>
        <button className="btn btn-ghost text-xs py-1.5">Contracts</button>
        <button className="btn btn-ghost text-xs py-1.5">Medical</button>
        <button className="btn btn-ghost text-xs py-1.5">Invoices</button>
        <button className="btn btn-ghost text-xs py-1.5">Insurance</button>
      </div>

      {/* Document List */}
      {filteredDocuments.length > 0 ? (
        <div className="space-y-2">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="card flex items-center gap-4 p-4 cursor-pointer hover:border-[var(--border-light)]"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center">
                <FileText className="h-5 w-5 text-[var(--text-muted)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{doc.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {doc.size} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`badge ${typeColors[doc.type]} capitalize`}>{doc.type}</span>
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="empty-state card">
          <FileText className="h-12 w-12 text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-primary)] font-medium mb-2">No documents yet</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">Upload your first document to get started</p>
          <button className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Upload your first document
          </button>
        </div>
      ) : (
        <p className="text-center text-[var(--text-muted)] py-8">No documents match your search</p>
      )}
    </div>
  )
}
