/**
 * FILE: modules/documents/components/DocumentDetailSheet.tsx
 * ZONE: Green
 * PURPOSE: Detail sheet for viewing document info, PDF viewer, and AI analysis
 * EXPORTS: DocumentDetailSheet
 * DEPENDS ON: lucide-react, useUpdateDocument, useDeleteDocument
 * CONSUMED BY: DocumentsPage
 * TESTS: modules/documents/tests/DocumentDetailSheet.test.tsx
 * LAST CHANGED: 2026-03-07 — Added PDF viewer and AI confidence indicator
 */

"use client"

import { useState } from "react"
import {
  X,
  FileText,
  ExternalLink,
  Download,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  User,
  Hash,
  Tag,
  Building2,
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  FileWarning,
} from "lucide-react"
import { useUpdateDocument, useDeleteDocument } from "../hooks/useDocuments"
import type { Document, DocumentStatus } from "@/lib/types"

interface DocumentDetailSheetProps {
  document: Document
  entityName?: string
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onRefetch: () => void
}

const statusConfig: Record<
  DocumentStatus,
  { icon: typeof CheckCircle; color: string; label: string }
> = {
  valid: {
    icon: CheckCircle,
    color: "text-green-400 bg-green-400/10",
    label: "Valid",
  },
  expiring: {
    icon: AlertTriangle,
    color: "text-yellow-400 bg-yellow-400/10",
    label: "Expiring Soon",
  },
  expired: {
    icon: AlertTriangle,
    color: "text-red-400 bg-red-400/10",
    label: "Expired",
  },
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

const confidenceConfig: Record<string, { color: string; percent: number }> = {
  high: { color: "text-green-400", percent: 94 },
  medium: { color: "text-yellow-400", percent: 75 },
  low: { color: "text-red-400", percent: 50 },
}

export function DocumentDetailSheet({
  document,
  entityName,
  onClose,
  onEdit,
  onDelete,
  onRefetch,
}: DocumentDetailSheetProps) {
  const { updateAiSummary } = useUpdateDocument()
  const { deleteDocument } = useDeleteDocument()
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [feedbackGiven, setFeedbackGiven] = useState<"correct" | "wrong" | null>(null)

  const StatusIcon = statusConfig[document.status].icon
  const confidence = document.aiConfidence || "medium"
  const confidenceInfo = confidenceConfig[confidence] || confidenceConfig.medium

  // Calculate days until expiry
  const daysUntilExpiry = document.expiryDate
    ? Math.ceil(
        (new Date(document.expiryDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null

  // Check if we can show the PDF viewer
  const canViewPdf = document.fileData || document.fileUrl

  const handleAnalyse = async () => {
    if (!document.fileUrl && !document.fileData) {
      setAiError("No file to analyse")
      return
    }

    setIsAnalysing(true)
    setAiError(null)

    try {
      const response = await fetch("/api/analyse-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(document.fileData
            ? { pdfBase64: document.fileData }
            : { documentUrl: document.fileUrl }),
          documentTitle: document.title || document.name,
          category: document.category,
        }),
      })

      const data = await response.json()

      if (data.success && data.summary) {
        await updateAiSummary(document.id, data.summary)
        onRefetch()
      } else {
        setAiError(data.error || "Failed to analyse document")
      }
    } catch (err) {
      console.error("Analysis error:", err)
      setAiError("Failed to analyse document")
    } finally {
      setIsAnalysing(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const success = await deleteDocument(document.id)
    setIsDeleting(false)

    if (success) {
      onDelete()
      onClose()
    }
  }

  const handleFeedback = (feedback: "correct" | "wrong") => {
    setFeedbackGiven(feedback)
    // TODO: Track feedback for improving AI prompts
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg h-full bg-[var(--bg-surface)] border-l border-[var(--border)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 border-b border-[var(--border)] bg-[var(--bg-surface)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-[var(--text-muted)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate">
                {document.title || document.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-blue text-xs">
                  {categoryLabels[document.category] || document.category}
                </span>
                <span
                  className={`badge ${statusConfig[document.status].color} text-xs flex items-center gap-1`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig[document.status].label}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* PDF Viewer Section */}
          {canViewPdf && (
            <div className="card overflow-hidden">
              {showPdfViewer ? (
                <div className="relative">
                  {document.fileData ? (
                    <iframe
                      src={`data:application/pdf;base64,${document.fileData}`}
                      className="w-full h-96 border-0"
                      title="Document viewer"
                    />
                  ) : document.fileUrl ? (
                    <iframe
                      src={document.fileUrl}
                      className="w-full h-96 border-0"
                      title="Document viewer"
                    />
                  ) : null}
                  <button
                    onClick={() => setShowPdfViewer(false)}
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowPdfViewer(true)}
                  className="w-full p-6 flex flex-col items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <Eye className="h-8 w-8" />
                  <span className="text-sm font-medium">View Document</span>
                </button>
              )}
            </div>
          )}

          {!canViewPdf && (
            <div className="card p-6 flex flex-col items-center gap-2 text-[var(--text-muted)]">
              <FileWarning className="h-8 w-8" />
              <span className="text-sm">No file attached</span>
            </div>
          )}

          {/* Details Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Details
            </h3>

            {entityName && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">Linked to:</span>
                <span className="text-[var(--text-primary)]">{entityName}</span>
              </div>
            )}

            {document.documentDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">Document date:</span>
                <span className="text-[var(--text-primary)]">
                  {new Date(document.documentDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {document.expiryDate && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">Expiry date:</span>
                <span
                  className={`${document.status === "expired" ? "text-red-400" : document.status === "expiring" ? "text-yellow-400" : "text-[var(--text-primary)]"}`}
                >
                  {new Date(document.expiryDate).toLocaleDateString()}
                  {daysUntilExpiry !== null && (
                    <span className="ml-2">
                      (
                      {daysUntilExpiry < 0
                        ? `${Math.abs(daysUntilExpiry)} days ago`
                        : `${daysUntilExpiry} days left`}
                      )
                    </span>
                  )}
                </span>
              </div>
            )}

            {document.issuedBy && (
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">Issued by:</span>
                <span className="text-[var(--text-primary)]">
                  {document.issuedBy}
                </span>
              </div>
            )}

            {document.referenceNumber && (
              <div className="flex items-center gap-3 text-sm">
                <Hash className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">Reference:</span>
                <span className="text-[var(--text-primary)] font-mono">
                  {document.referenceNumber}
                </span>
              </div>
            )}

            {document.tags && document.tags.length > 0 && (
              <div className="flex items-start gap-3 text-sm">
                <Tag className="h-4 w-4 text-[var(--text-muted)] mt-0.5" />
                <span className="text-[var(--text-muted)]">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag) => (
                    <span key={tag} className="badge badge-gray text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {document.notes && (
              <div className="pt-2">
                <p className="text-sm text-[var(--text-muted)] mb-1">Notes:</p>
                <p className="text-sm text-[var(--text-primary)] bg-[var(--bg-elevated)] rounded-lg p-3">
                  {document.notes}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
              <span>
                Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
              </span>
              {document.fileSize && <span>• {document.fileSize}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            {document.fileUrl && (
              <>
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary justify-center"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
                <a
                  href={document.fileUrl}
                  download
                  className="btn btn-secondary justify-center"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </>
            )}
            <button onClick={onEdit} className="btn btn-secondary justify-center">
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-danger justify-center"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>

          {/* AI Summary Section */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--purple)]" />
                <h3 className="font-medium text-[var(--text-primary)]">
                  AI Summary
                </h3>
              </div>
              {document.aiConfidence && (
                <span
                  className={`text-xs ${confidenceInfo.color} flex items-center gap-1`}
                >
                  <span className="font-mono">{confidenceInfo.percent}%</span>{" "}
                  confidence
                </span>
              )}
            </div>

            {document.aiSummary ? (
              <>
                <p className="text-sm text-[var(--text-secondary)]">
                  {document.aiSummary}
                </p>

                {/* Feedback Section */}
                {!feedbackGiven ? (
                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                    <span className="text-xs text-[var(--text-muted)]">
                      Was this helpful?
                    </span>
                    <button
                      onClick={() => handleFeedback("correct")}
                      className="p-1.5 rounded hover:bg-green-500/10 text-[var(--text-muted)] hover:text-green-400"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback("wrong")}
                      className="p-1.5 rounded hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                    {feedbackGiven === "correct"
                      ? "Thanks for the feedback!"
                      : "Thanks! We'll use this to improve."}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                No AI summary yet. Click the button below to analyse this
                document.
              </p>
            )}

            {aiError && <p className="text-sm text-[var(--red)]">{aiError}</p>}

            <button
              onClick={handleAnalyse}
              disabled={isAnalysing || (!document.fileUrl && !document.fileData)}
              className="btn btn-secondary w-full justify-center disabled:opacity-50"
            >
              {isAnalysing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analysing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {document.aiSummary ? "Re-analyse" : "Analyse with AI"}
                </>
              )}
            </button>

            {!document.fileUrl && !document.fileData && (
              <p className="text-xs text-[var(--text-muted)]">
                Add a file to enable AI analysis.
              </p>
            )}
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="relative bg-[var(--bg-surface)] rounded-lg p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Delete Document?
              </h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Are you sure you want to delete &quot;
                {document.title || document.name}&quot;? This action cannot be
                undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 btn btn-danger"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
