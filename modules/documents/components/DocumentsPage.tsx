/**
 * FILE: modules/documents/components/DocumentsPage.tsx
 * ZONE: Green
 * PURPOSE: Document management page with upload, filtering, and detail view
 * EXPORTS: DocumentsPage
 * DEPENDS ON: useDocuments, DocumentUploadSheet, DocumentDetailSheet, BulkUploadSheet, Skeleton
 * CONSUMED BY: app/documents/page.tsx
 * TESTS: modules/documents/tests/DocumentsPage.test.tsx
 * LAST CHANGED: 2026-03-07 — Full rewrite with Supabase integration
 */

"use client"

import { useState, useMemo } from "react"
import { FileText, Upload, FolderUp, Search, Plus, Building2, Rabbit, Users, Users2, Receipt, Shield } from "lucide-react"
import { Skeleton } from "@/modules/dashboard"
import { useHorses } from "@/modules/horses"
import { useClients } from "@/modules/clients"
import { useStaff } from "@/modules/staff"
import { useDocuments, type CategoryGroup } from "../hooks/useDocuments"
import { DocumentUploadSheet } from "./DocumentUploadSheet"
import { DocumentDetailSheet } from "./DocumentDetailSheet"
import { BulkUploadSheet } from "./BulkUploadSheet"
import type { Document, DocumentStatus } from "@/lib/types"

type ModalState =
  | { type: "upload" }
  | { type: "bulk" }
  | { type: "detail"; document: Document }
  | { type: "edit"; document: Document }
  | null

const categoryGroupConfig: { key: CategoryGroup; label: string; icon: typeof Building2 }[] = [
  { key: "all", label: "All", icon: FileText },
  { key: "stable", label: "Stable", icon: Building2 },
  { key: "horses", label: "Horses", icon: Rabbit },
  { key: "clients", label: "Clients", icon: Users },
  { key: "staff", label: "Staff", icon: Users2 },
  { key: "financial", label: "Financial", icon: Receipt },
  { key: "compliance", label: "Compliance", icon: Shield },
]

const statusColors: Record<DocumentStatus, string> = {
  valid: "badge-green",
  expiring: "badge-yellow",
  expired: "badge-red",
}

const categoryLabels: Record<string, string> = {
  stable_license: "Stable License",
  stable_insurance: "Stable Insurance",
  stable_contract: "Stable Contract",
  horse_passport: "Horse Passport",
  horse_vaccination: "Vaccination Record",
  horse_insurance: "Horse Insurance",
  horse_medical: "Medical Record",
  client_contract: "Client Contract",
  client_insurance: "Client Insurance",
  client_invoice: "Invoice",
  staff_contract: "Staff Contract",
  staff_certification: "Certification",
  financial_report: "Financial Report",
  compliance_audit: "Compliance Audit",
  other: "Other",
}

// BREADCRUMB: Skeleton loading state
function DocumentsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  )
}

export function DocumentsPage() {
  const [search, setSearch] = useState("")
  const [activeGroup, setActiveGroup] = useState<CategoryGroup>("all")
  const [modalState, setModalState] = useState<ModalState>(null)

  const { documents, isLoading, refetch } = useDocuments(activeGroup)
  const { horses } = useHorses()
  const { clients } = useClients()
  const { staff } = useStaff()

  // BREADCRUMB: Get entity name for display
  const getEntityName = (doc: Document): string | undefined => {
    switch (doc.entityType) {
      case "horse":
        return horses.find((h) => h.id === doc.entityId)?.name
      case "client":
        return clients.find((c) => c.id === doc.entityId)?.fullName
      case "staff":
        return staff.find((s) => s.id === doc.entityId)?.fullName
      case "stable":
        return "Stable"
      default:
        return undefined
    }
  }

  // BREADCRUMB: Filter documents by search
  const filteredDocuments = useMemo(() => {
    if (!search) return documents
    const searchLower = search.toLowerCase()
    return documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchLower) ||
        doc.title?.toLowerCase().includes(searchLower) ||
        doc.tags?.some((t) => t.toLowerCase().includes(searchLower)) ||
        categoryLabels[doc.category]?.toLowerCase().includes(searchLower)
    )
  }, [documents, search])

  if (isLoading) {
    return <DocumentsPageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Documents</h1>
        <div className="flex gap-2">
          <button onClick={() => setModalState({ type: "bulk" })} className="btn btn-secondary">
            <FolderUp className="h-4 w-4" />
            Bulk Upload
          </button>
          <button onClick={() => setModalState({ type: "upload" })} className="btn btn-primary">
            <Upload className="h-4 w-4" />
            Upload Document
          </button>
        </div>
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

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categoryGroupConfig.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveGroup(key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeGroup === key
                ? "bg-[var(--green-primary)] text-white"
                : "bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Document List */}
      {filteredDocuments.length > 0 ? (
        <div className="space-y-2">
          {filteredDocuments.map((doc) => {
            const entityName = getEntityName(doc)
            return (
              <div
                key={doc.id}
                onClick={() => setModalState({ type: "detail", document: doc })}
                className="card flex items-center gap-4 p-4 cursor-pointer hover:border-[var(--border-light)] transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-[var(--text-muted)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {doc.title || doc.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {categoryLabels[doc.category] || doc.category}
                    {entityName && ` • ${entityName}`}
                    {doc.expiryDate && ` • Expires ${new Date(doc.expiryDate).toLocaleDateString()}`}
                  </p>
                </div>
                <span className={`badge ${statusColors[doc.status]} capitalize text-xs`}>
                  {doc.status}
                </span>
              </div>
            )
          })}
        </div>
      ) : documents.length === 0 ? (
        <div className="empty-state card">
          <FileText className="h-12 w-12 text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-primary)] font-medium mb-2">No documents yet</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">Upload your first document to get started</p>
          <button onClick={() => setModalState({ type: "upload" })} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Upload your first document
          </button>
        </div>
      ) : (
        <p className="text-center text-[var(--text-muted)] py-8">No documents match your search</p>
      )}

      {/* Upload Sheet */}
      {modalState?.type === "upload" && (
        <DocumentUploadSheet
          onClose={() => setModalState(null)}
          onSuccess={refetch}
        />
      )}

      {/* Bulk Upload Sheet */}
      {modalState?.type === "bulk" && (
        <BulkUploadSheet
          onClose={() => setModalState(null)}
          onSuccess={refetch}
        />
      )}

      {/* Detail Sheet */}
      {modalState?.type === "detail" && (
        <DocumentDetailSheet
          document={modalState.document}
          entityName={getEntityName(modalState.document)}
          onClose={() => setModalState(null)}
          onEdit={() => setModalState({ type: "edit", document: modalState.document })}
          onDelete={refetch}
          onRefetch={refetch}
        />
      )}

      {/* Edit Sheet - reuses upload sheet with pre-filled data */}
      {modalState?.type === "edit" && (
        <DocumentUploadSheet
          onClose={() => setModalState({ type: "detail", document: modalState.document })}
          onSuccess={() => {
            refetch()
            setModalState(null)
          }}
        />
      )}
    </div>
  )
}
