/**
 * FILE: modules/documents/components/DocumentUploadSheet.tsx
 * ZONE: Green
 * PURPOSE: Sheet/modal for uploading new documents with full form
 * EXPORTS: DocumentUploadSheet
 * DEPENDS ON: lucide-react, useAddDocument, useHorses, useClients, useStaff
 * CONSUMED BY: DocumentsPage
 * TESTS: modules/documents/tests/DocumentUploadSheet.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation
 */

"use client"

import { useState, useEffect } from "react"
import { X, Upload, Link2, Building2, Rabbit, Users, Users2 } from "lucide-react"
import { useAddDocument, type AddDocumentInput } from "../hooks/useDocuments"
import { useHorses } from "@/modules/horses"
import { useClients } from "@/modules/clients"
import { useStaff } from "@/modules/staff"
import { useAuth } from "@/lib/hooks/useAuth"
import type { DocumentCategory, DocumentEntityType } from "@/lib/types"

interface DocumentUploadSheetProps {
  onClose: () => void
  onSuccess: () => void
}

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string; group: string }[] = [
  // Stable
  { value: "stable_license", label: "Stable License", group: "Stable" },
  { value: "stable_insurance", label: "Stable Insurance", group: "Stable" },
  { value: "stable_contract", label: "Stable Contract", group: "Stable" },
  // Horses
  { value: "horse_passport", label: "Horse Passport", group: "Horses" },
  { value: "horse_vaccination", label: "Vaccination Record", group: "Horses" },
  { value: "horse_insurance", label: "Horse Insurance", group: "Horses" },
  { value: "horse_medical", label: "Medical Record", group: "Horses" },
  // Clients
  { value: "client_contract", label: "Client Contract", group: "Clients" },
  { value: "client_insurance", label: "Client Insurance", group: "Clients" },
  { value: "client_invoice", label: "Invoice", group: "Clients" },
  // Staff
  { value: "staff_contract", label: "Staff Contract", group: "Staff" },
  { value: "staff_certification", label: "Certification", group: "Staff" },
  // Financial & Compliance
  { value: "financial_report", label: "Financial Report", group: "Financial" },
  { value: "compliance_audit", label: "Compliance Audit", group: "Compliance" },
  { value: "other", label: "Other", group: "Other" },
]

export function DocumentUploadSheet({ onClose, onSuccess }: DocumentUploadSheetProps) {
  const { currentUser } = useAuth()
  const { addDocument } = useAddDocument()
  const { horses } = useHorses()
  const { clients } = useClients()
  const { staff } = useStaff()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<DocumentCategory>("other")
  const [entityType, setEntityType] = useState<DocumentEntityType>("stable")
  const [entityId, setEntityId] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [documentDate, setDocumentDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [issuedBy, setIssuedBy] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [tags, setTags] = useState("")
  const [notes, setNotes] = useState("")

  // Set default entity ID when type changes
  useEffect(() => {
    if (entityType === "stable" && currentUser?.stableId) {
      setEntityId(currentUser.stableId)
    } else {
      setEntityId("")
    }
  }, [entityType, currentUser?.stableId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!entityId) {
      setError("Please select what this document is linked to")
      return
    }

    setIsSubmitting(true)

    const input: AddDocumentInput = {
      entityType,
      entityId,
      name: title,
      title,
      category,
      fileUrl: fileUrl || undefined,
      documentDate: documentDate || undefined,
      expiryDate: expiryDate || undefined,
      issuedBy: issuedBy || undefined,
      referenceNumber: referenceNumber || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      notes: notes || undefined,
    }

    const result = await addDocument(input)

    setIsSubmitting(false)

    if (result.success) {
      onSuccess()
      onClose()
    } else {
      setError(result.error || "Failed to upload document")
    }
  }

  const getEntityOptions = () => {
    switch (entityType) {
      case "horse":
        return horses.map((h) => ({ id: h.id, name: h.name }))
      case "client":
        return clients.map((c) => ({ id: c.id, name: c.fullName }))
      case "staff":
        return staff.map((s) => ({ id: s.id, name: s.fullName }))
      default:
        return []
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg h-full bg-[var(--bg-surface)] border-l border-[var(--border)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <Upload className="h-5 w-5 text-[var(--green-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Upload Document</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--red)]/10 border border-[var(--red)]/20 text-[var(--red)] text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Title <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Insurance Policy 2026"
              className="input"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="input"
            >
              {Object.entries(
                CATEGORY_OPTIONS.reduce((acc, opt) => {
                  if (!acc[opt.group]) acc[opt.group] = []
                  acc[opt.group].push(opt)
                  return acc
                }, {} as Record<string, typeof CATEGORY_OPTIONS>)
              ).map(([group, options]) => (
                <optgroup key={group} label={group}>
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Link to Entity */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Link to</label>
            <div className="flex gap-2 mb-2">
              {[
                { type: "stable" as const, icon: Building2, label: "Stable" },
                { type: "horse" as const, icon: Rabbit, label: "Horse" },
                { type: "client" as const, icon: Users, label: "Client" },
                { type: "staff" as const, icon: Users2, label: "Staff" },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEntityType(type)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                    entityType === type
                      ? "bg-[var(--green-primary)] text-white"
                      : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {entityType !== "stable" && (
              <select
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className="input"
                required
              >
                <option value="">Select {entityType}...</option>
                {getEntityOptions().map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* File URL */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              <Link2 className="inline h-4 w-4 mr-1" />
              File URL
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
              className="input"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Paste a link to the document. File upload coming in V3.
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Document Date</label>
              <input
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Issued By & Reference */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Issued By</label>
              <input
                type="text"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                placeholder="e.g., Allianz Insurance"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Reference Number</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g., POL-2026-12345"
                className="input"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="insurance, annual, premium (comma separated)"
              className="input"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[var(--border)]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn btn-primary disabled:opacity-50"
            >
              {isSubmitting ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
