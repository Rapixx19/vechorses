/**
 * FILE: modules/documents/components/BulkUploadSheet.tsx
 * ZONE: Green
 * PURPOSE: Sheet for bulk uploading multiple documents with AI analysis
 * EXPORTS: BulkUploadSheet
 * DEPENDS ON: lucide-react, useAddDocument
 * CONSUMED BY: DocumentsPage
 * TESTS: modules/documents/tests/BulkUploadSheet.test.tsx
 * LAST CHANGED: 2026-03-07 — Added smart AI analysis for bulk uploads
 */

"use client"

import { useState, useCallback } from "react"
import {
  X,
  Upload,
  FileText,
  Check,
  AlertCircle,
  Trash2,
  FolderUp,
  Sparkles,
  Loader2,
  FileWarning,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useAddDocument } from "../hooks/useDocuments"
import { useAuth } from "@/lib/hooks/useAuth"
import type { DocumentCategory, DocumentEntityType } from "@/lib/types"

interface BulkUploadSheetProps {
  onClose: () => void
  onSuccess: () => void
}

interface QueuedFile {
  id: string
  file: File
  name: string
  title: string
  category: DocumentCategory
  entityType: DocumentEntityType
  fileBase64: string | null
  aiSummary?: string
  aiConfidence?: string
  status: "pending" | "analysing" | "ready" | "uploading" | "success" | "error" | "manual"
  error?: string
  isExpanded: boolean
  documentDate?: string
  expiryDate?: string
  issuedBy?: string
  referenceNumber?: string
  tags?: string
}

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: "stable_license", label: "Stable License" },
  { value: "stable_insurance", label: "Stable Insurance" },
  { value: "horse_passport", label: "Horse Passport" },
  { value: "horse_vaccination", label: "Vaccination Record" },
  { value: "horse_medical", label: "Medical Record" },
  { value: "client_contract", label: "Client Contract" },
  { value: "staff_contract", label: "Staff Contract" },
  { value: "financial_report", label: "Financial Report" },
  { value: "other", label: "Other" },
]

const MAX_FILE_SIZE_MB = 2

// BREADCRUMB: Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(",")[1]
      resolve(base64)
    }
    reader.onerror = reject
  })
}

export function BulkUploadSheet({ onClose, onSuccess }: BulkUploadSheetProps) {
  const { currentUser } = useAuth()
  const { addDocument } = useAddDocument()

  const [files, setFiles] = useState<QueuedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // BREADCRUMB: Analyse a single file with AI
  const analyseFile = async (queuedFile: QueuedFile): Promise<Partial<QueuedFile>> => {
    const extension = queuedFile.name.split(".").pop()?.toLowerCase()

    // Word docs can't be analysed
    if (extension === "doc" || extension === "docx") {
      return { status: "manual" }
    }

    // Only analyse PDFs and images
    if (extension !== "pdf" && !["jpg", "jpeg", "png"].includes(extension || "")) {
      return { status: "manual" }
    }

    try {
      const base64 = await fileToBase64(queuedFile.file)
      const isPdf = extension === "pdf"
      const mediaType = isPdf
        ? "application/pdf"
        : `image/${extension === "jpg" ? "jpeg" : extension}`

      const response = await fetch("/api/analyse-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isPdf ? { pdfBase64: base64 } : { imageBase64: base64, mediaType }),
          fileName: queuedFile.name,
        }),
      })

      const data = await response.json()

      if (data.success) {
        return {
          status: "ready",
          fileBase64: base64,
          title: data.title || queuedFile.title,
          category: data.category || "other",
          entityType: data.entityType || "stable",
          aiSummary: data.summary,
          aiConfidence: data.confidence,
          documentDate: data.documentDate || undefined,
          expiryDate: data.expiryDate || undefined,
          issuedBy: data.issuedBy || undefined,
          referenceNumber: data.referenceNumber || undefined,
          tags: data.suggestedTags?.join(", ") || undefined,
        }
      } else {
        return { status: "manual", fileBase64: base64 }
      }
    } catch (err) {
      console.error("Analysis error:", err)
      return { status: "manual" }
    }
  }

  // BREADCRUMB: Handle file drop/selection
  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: QueuedFile[] = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      category: "other" as DocumentCategory,
      entityType: "stable" as DocumentEntityType,
      fileBase64: null,
      status: "pending" as const,
      isExpanded: false,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Start analysing each file
    for (const queuedFile of newFiles) {
      setFiles((prev) =>
        prev.map((f) => (f.id === queuedFile.id ? { ...f, status: "analysing" } : f))
      )

      const updates = await analyseFile(queuedFile)

      setFiles((prev) =>
        prev.map((f) => (f.id === queuedFile.id ? { ...f, ...updates } : f))
      )
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const updateFile = (id: string, updates: Partial<QueuedFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const toggleExpand = (id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isExpanded: !f.isExpanded } : f))
    )
  }

  const handleUploadAll = async () => {
    if (!currentUser?.stableId) return

    setIsUploading(true)

    for (const file of files) {
      if (file.status === "success") continue

      updateFile(file.id, { status: "uploading" })

      const sizeMB = file.file.size / (1024 * 1024)
      const fileData = sizeMB <= MAX_FILE_SIZE_MB ? file.fileBase64 : null

      const result = await addDocument({
        entityType: file.entityType,
        entityId: currentUser.stableId,
        name: file.name,
        title: file.title,
        category: file.category,
        fileData: fileData || undefined,
        documentDate: file.documentDate,
        expiryDate: file.expiryDate,
        issuedBy: file.issuedBy,
        referenceNumber: file.referenceNumber,
        tags: file.tags ? file.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        aiSummary: file.aiSummary,
        aiConfidence: file.aiConfidence,
      })

      if (result.success) {
        updateFile(file.id, { status: "success" })
      } else {
        updateFile(file.id, { status: "error", error: result.error })
      }
    }

    setIsUploading(false)

    const allSuccess = files.every((f) => f.status === "success")
    if (allSuccess) {
      onSuccess()
    }
  }

  const readyCount = files.filter(
    (f) => f.status === "ready" || f.status === "manual" || f.status === "error"
  ).length
  const successCount = files.filter((f) => f.status === "success").length
  const analysingCount = files.filter((f) => f.status === "analysing").length

  const getStatusIcon = (file: QueuedFile) => {
    switch (file.status) {
      case "success":
        return <Check className="h-4 w-4 text-green-400" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      case "uploading":
      case "analysing":
        return (
          <Loader2 className="h-4 w-4 text-[var(--purple)] animate-spin" />
        )
      case "manual":
        return <FileWarning className="h-4 w-4 text-yellow-400" />
      case "ready":
        return <Sparkles className="h-4 w-4 text-[var(--purple)]" />
      default:
        return <FileText className="h-4 w-4 text-[var(--text-muted)]" />
    }
  }

  const getStatusLabel = (file: QueuedFile) => {
    switch (file.status) {
      case "analysing":
        return "Analysing..."
      case "ready":
        return `AI: ${file.category.replace("_", " ")}`
      case "manual":
        return "Manual entry"
      case "uploading":
        return "Uploading..."
      case "success":
        return "Uploaded"
      case "error":
        return "Failed"
      default:
        return "Pending"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-xl h-full bg-[var(--bg-surface)] border-l border-[var(--border)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <FolderUp className="h-5 w-5 text-[var(--green-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Smart Bulk Upload
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Info Banner */}
          <div className="p-3 rounded-lg bg-[var(--purple)]/10 border border-[var(--purple)]/20 text-sm">
            <div className="flex items-center gap-2 text-[var(--purple)] mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">AI-Powered Analysis</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Drop PDFs and images. AI will automatically classify each document
              and extract key information.
            </p>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-[var(--green-primary)] bg-[var(--green-glow)]"
                : "border-[var(--border)] hover:border-[var(--border-light)]"
            }`}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-[var(--text-primary)] font-medium mb-1">
              Drop files here
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              PDF, JPG, PNG supported
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ position: "relative", marginTop: "1rem" }}
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-[var(--text-muted)]">
                {files.length} file{files.length !== 1 ? "s" : ""}
                {analysingCount > 0 && ` • ${analysingCount} analysing`}
                {successCount > 0 && ` • ${successCount} uploaded`}
              </p>

              {files.map((file) => (
                <div
                  key={file.id}
                  className={`card overflow-hidden ${
                    file.status === "success"
                      ? "border-green-500/30 bg-green-500/5"
                      : file.status === "error"
                      ? "border-red-500/30 bg-red-500/5"
                      : file.status === "ready"
                      ? "border-[var(--purple)]/30 bg-[var(--purple)]/5"
                      : ""
                  }`}
                >
                  {/* File Header */}
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer"
                    onClick={() => toggleExpand(file.id)}
                  >
                    <div className="w-8 h-8 rounded bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(file)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {file.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {getStatusLabel(file)}
                      </p>
                    </div>

                    {file.status !== "success" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(file.id)
                        }}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--red)]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    {file.status !== "analysing" && file.status !== "uploading" && (
                      <button className="p-1 text-[var(--text-muted)]">
                        {file.isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {file.isExpanded && file.status !== "analysing" && (
                    <div className="px-3 pb-3 space-y-2 border-t border-[var(--border)]">
                      <div className="pt-2">
                        <input
                          type="text"
                          value={file.title}
                          onChange={(e) =>
                            updateFile(file.id, { title: e.target.value })
                          }
                          className="input text-sm py-1"
                          placeholder="Document title"
                          disabled={file.status === "success"}
                        />
                      </div>

                      <select
                        value={file.category}
                        onChange={(e) =>
                          updateFile(file.id, {
                            category: e.target.value as DocumentCategory,
                          })
                        }
                        className="input text-xs py-1"
                        disabled={file.status === "success"}
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {file.aiSummary && (
                        <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] rounded p-2">
                          {file.aiSummary}
                        </p>
                      )}

                      {file.error && (
                        <p className="text-xs text-red-400">{file.error}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {files.length > 0 && readyCount > 0 && (
            <button
              onClick={handleUploadAll}
              disabled={isUploading || analysingCount > 0}
              className="w-full btn btn-primary disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : analysingCount > 0 ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analysing {analysingCount} file{analysingCount !== 1 ? "s" : ""}...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Upload {readyCount} Document{readyCount !== 1 ? "s" : ""}
                </>
              )}
            </button>
          )}

          {files.length > 0 &&
            readyCount === 0 &&
            successCount === files.length && (
              <button onClick={onClose} className="w-full btn btn-primary">
                Done
              </button>
            )}
        </div>
      </div>
    </div>
  )
}
