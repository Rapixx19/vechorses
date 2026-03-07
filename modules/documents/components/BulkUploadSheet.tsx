/**
 * FILE: modules/documents/components/BulkUploadSheet.tsx
 * ZONE: Green
 * PURPOSE: Sheet for bulk uploading multiple documents
 * EXPORTS: BulkUploadSheet
 * DEPENDS ON: lucide-react, useAddDocument
 * CONSUMED BY: DocumentsPage
 * TESTS: modules/documents/tests/BulkUploadSheet.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation
 */

"use client"

import { useState, useCallback } from "react"
import { X, Upload, FileText, Check, AlertCircle, Trash2, FolderUp } from "lucide-react"
import { useAddDocument } from "../hooks/useDocuments"
import { useAuth } from "@/lib/hooks/useAuth"
import type { DocumentCategory } from "@/lib/types"

interface BulkUploadSheetProps {
  onClose: () => void
  onSuccess: () => void
}

interface QueuedFile {
  id: string
  name: string
  title: string
  category: DocumentCategory
  url: string
  status: "pending" | "uploading" | "success" | "error"
  error?: string
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

export function BulkUploadSheet({ onClose, onSuccess }: BulkUploadSheetProps) {
  const { currentUser } = useAuth()
  const { addDocument } = useAddDocument()

  const [files, setFiles] = useState<QueuedFile[]>([])
  const [globalCategory, setGlobalCategory] = useState<DocumentCategory>("other")
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // BREADCRUMB: Handle file drop/selection
  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: QueuedFile[] = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      category: globalCategory,
      url: "",
      status: "pending" as const,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [globalCategory])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

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

  const applyGlobalCategory = () => {
    setFiles((prev) => prev.map((f) => ({ ...f, category: globalCategory })))
  }

  const handleUploadAll = async () => {
    if (!currentUser?.stableId) return

    setIsUploading(true)

    for (const file of files) {
      if (file.status === "success") continue

      updateFile(file.id, { status: "uploading" })

      const result = await addDocument({
        entityType: "stable",
        entityId: currentUser.stableId,
        name: file.name,
        title: file.title,
        category: file.category,
        fileUrl: file.url || undefined,
      })

      if (result.success) {
        updateFile(file.id, { status: "success" })
      } else {
        updateFile(file.id, { status: "error", error: result.error })
      }
    }

    setIsUploading(false)

    // Check if all succeeded
    const allSuccess = files.every((f) => f.status === "success")
    if (allSuccess) {
      onSuccess()
    }
  }

  const pendingCount = files.filter((f) => f.status === "pending" || f.status === "error").length
  const successCount = files.filter((f) => f.status === "success").length

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
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Bulk Upload</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Info Banner */}
          <div className="p-3 rounded-lg bg-[var(--blue)]/10 border border-[var(--blue)]/20 text-sm text-[var(--blue)]">
            <p className="font-medium mb-1">Supabase Storage coming in V3</p>
            <p className="text-xs opacity-80">
              For now, drop files to auto-detect titles, then manually add URLs for each document.
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
            <p className="text-[var(--text-primary)] font-medium mb-1">Drop files here</p>
            <p className="text-sm text-[var(--text-muted)]">or click to select files</p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ position: "relative" }}
            />
          </div>

          {/* Global Category */}
          {files.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={globalCategory}
                onChange={(e) => setGlobalCategory(e.target.value as DocumentCategory)}
                className="input flex-1"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button onClick={applyGlobalCategory} className="btn btn-secondary">
                Apply to All
              </button>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-[var(--text-muted)]">
                {files.length} file{files.length !== 1 ? "s" : ""} queued
                {successCount > 0 && ` • ${successCount} uploaded`}
              </p>

              {files.map((file) => (
                <div
                  key={file.id}
                  className={`card p-3 ${
                    file.status === "success"
                      ? "border-green-500/30 bg-green-500/5"
                      : file.status === "error"
                      ? "border-red-500/30 bg-red-500/5"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                      {file.status === "success" ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : file.status === "error" ? (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      ) : file.status === "uploading" ? (
                        <div className="h-4 w-4 border-2 border-[var(--green-primary)] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 text-[var(--text-muted)]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        type="text"
                        value={file.title}
                        onChange={(e) => updateFile(file.id, { title: e.target.value })}
                        className="input text-sm py-1"
                        placeholder="Document title"
                        disabled={file.status === "success"}
                      />

                      <div className="flex gap-2">
                        <select
                          value={file.category}
                          onChange={(e) => updateFile(file.id, { category: e.target.value as DocumentCategory })}
                          className="input text-xs py-1 flex-1"
                          disabled={file.status === "success"}
                        >
                          {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="url"
                        value={file.url}
                        onChange={(e) => updateFile(file.id, { url: e.target.value })}
                        className="input text-xs py-1"
                        placeholder="File URL (optional)"
                        disabled={file.status === "success"}
                      />

                      {file.error && (
                        <p className="text-xs text-red-400">{file.error}</p>
                      )}
                    </div>

                    {file.status !== "success" && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-[var(--text-muted)] hover:text-[var(--red)]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {files.length > 0 && pendingCount > 0 && (
            <button
              onClick={handleUploadAll}
              disabled={isUploading}
              className="w-full btn btn-primary disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : `Upload ${pendingCount} Document${pendingCount !== 1 ? "s" : ""}`}
            </button>
          )}

          {files.length > 0 && pendingCount === 0 && successCount === files.length && (
            <button onClick={onClose} className="w-full btn btn-primary">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
