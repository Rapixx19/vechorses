/**
 * FILE: modules/documents/components/DocumentUploadSheet.tsx
 * ZONE: Green
 * PURPOSE: Smart upload sheet with AI-powered document analysis and auto-fill
 * EXPORTS: DocumentUploadSheet
 * DEPENDS ON: lucide-react, useAddDocument, useHorses, useClients, useStaff
 * CONSUMED BY: DocumentsPage
 * TESTS: modules/documents/tests/DocumentUploadSheet.test.tsx
 * LAST CHANGED: 2026-03-07 — Added smart PDF analysis with AI auto-fill
 */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  X,
  Upload,
  Link2,
  Building2,
  Rabbit,
  Users,
  Users2,
  FileText,
  Loader2,
  Sparkles,
  AlertCircle,
  Check,
  Search,
} from "lucide-react"
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

// BREADCRUMB: AI analysis result type
interface AnalysisResult {
  title?: string
  category?: string
  categoryLabel?: string
  summary?: string
  documentDate?: string | null
  expiryDate?: string | null
  issuedBy?: string | null
  referenceNumber?: string | null
  suggestedTags?: string[]
  entities?: {
    horseName?: string | null
    clientName?: string | null
    staffName?: string | null
  }
  entityType?: string
  confidence?: string
}

type UploadStep = "drop" | "analysing" | "review" | "manual"

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

const MAX_FILE_SIZE_MB = 2

export function DocumentUploadSheet({ onClose, onSuccess }: DocumentUploadSheetProps) {
  const { currentUser } = useAuth()
  const { addDocument } = useAddDocument()
  const { horses } = useHorses()
  const { clients } = useClients()
  const { staff } = useStaff()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<UploadStep>("drop")
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileBase64, setFileBase64] = useState<string | null>(null)
  const [fileSizeWarning, setFileSizeWarning] = useState<string | null>(null)

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

  // BREADCRUMB: Auto-link entity based on AI-detected name
  useEffect(() => {
    if (!analysisResult?.entities) return

    const { horseName, clientName, staffName } = analysisResult.entities

    if (horseName) {
      const horse = horses.find(
        (h) => h.name.toLowerCase() === horseName.toLowerCase()
      )
      if (horse) {
        setEntityType("horse")
        setEntityId(horse.id)
      }
    } else if (clientName) {
      const client = clients.find(
        (c) => c.fullName.toLowerCase() === clientName.toLowerCase()
      )
      if (client) {
        setEntityType("client")
        setEntityId(client.id)
      }
    } else if (staffName) {
      const member = staff.find(
        (s) => s.fullName.toLowerCase() === staffName.toLowerCase()
      )
      if (member) {
        setEntityType("staff")
        setEntityId(member.id)
      }
    }
  }, [analysisResult, horses, clients, staff])

  // BREADCRUMB: Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix
        const base64 = result.split(",")[1]
        resolve(base64)
      }
      reader.onerror = reject
    })
  }

  // BREADCRUMB: Handle file selection
  const handleFile = useCallback(async (file: File) => {
    setSelectedFile(file)
    setError(null)
    setFileSizeWarning(null)

    const sizeMB = file.size / (1024 * 1024)

    // Check if file is too large for inline storage
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setFileSizeWarning(
        `File is ${sizeMB.toFixed(1)}MB. Please upload to Google Drive or Dropbox and paste the link.`
      )
    }

    const extension = file.name.split(".").pop()?.toLowerCase()

    // Check if we can analyse this file type
    if (extension === "doc" || extension === "docx") {
      setStep("manual")
      setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "))
      return
    }

    // For PDF and images, proceed with AI analysis
    if (extension === "pdf" || ["jpg", "jpeg", "png"].includes(extension || "")) {
      try {
        setStep("analysing")
        const base64 = await fileToBase64(file)
        setFileBase64(base64)

        const isPdf = extension === "pdf"
        const mediaType = isPdf
          ? "application/pdf"
          : `image/${extension === "jpg" ? "jpeg" : extension}`

        const response = await fetch("/api/analyse-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(isPdf ? { pdfBase64: base64 } : { imageBase64: base64, mediaType }),
            fileName: file.name,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setAnalysisResult(data)
          // Pre-fill form with AI results
          if (data.title) setTitle(data.title)
          if (data.category) setCategory(data.category as DocumentCategory)
          if (data.documentDate) setDocumentDate(data.documentDate)
          if (data.expiryDate) setExpiryDate(data.expiryDate)
          if (data.issuedBy) setIssuedBy(data.issuedBy)
          if (data.referenceNumber) setReferenceNumber(data.referenceNumber)
          if (data.suggestedTags?.length) setTags(data.suggestedTags.join(", "))
          if (data.summary) setNotes(data.summary)
          if (data.entityType) setEntityType(data.entityType as DocumentEntityType)
          setStep("review")
        } else {
          setError(data.error || "Failed to analyse document")
          setStep("manual")
          setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "))
        }
      } catch (err) {
        console.error("Analysis error:", err)
        setError("Failed to analyse document")
        setStep("manual")
        setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "))
      }
    } else {
      setStep("manual")
      setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "))
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0])
      }
    },
    [handleFile]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

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
      name: selectedFile?.name || title,
      title,
      category,
      fileUrl: fileUrl || undefined,
      fileData: fileBase64 && !fileSizeWarning ? fileBase64 : undefined,
      documentDate: documentDate || undefined,
      expiryDate: expiryDate || undefined,
      issuedBy: issuedBy || undefined,
      referenceNumber: referenceNumber || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      notes: notes || undefined,
      aiSummary: analysisResult?.summary || undefined,
      aiConfidence: analysisResult?.confidence || undefined,
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

  const getCategoryLabel = (cat: string) =>
    CATEGORY_OPTIONS.find((o) => o.value === cat)?.label || cat

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
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {step === "drop" ? "Upload Document" : step === "analysing" ? "Analysing..." : "Review & Save"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Step 1: Drop Zone */}
          {step === "drop" && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-[var(--green-primary)] bg-[var(--green-glow)]"
                  : "border-[var(--border)] hover:border-[var(--border-light)]"
              }`}
            >
              <FileText className="h-16 w-16 mx-auto mb-4 text-[var(--text-muted)]" />
              <p className="text-lg text-[var(--text-primary)] font-medium mb-2">
                Drop PDF here
              </p>
              <p className="text-sm text-[var(--text-muted)] mb-4">or click to browse</p>
              <p className="text-xs text-[var(--text-muted)]">
                AI will auto-fill the details
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
            </div>
          )}

          {/* Step 2: Analysing */}
          {step === "analysing" && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--purple)]/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[var(--purple)] animate-spin" />
              </div>
              <div>
                <p className="text-lg font-medium text-[var(--text-primary)] mb-2">
                  Analysing document...
                </p>
                <div className="max-w-xs mx-auto space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Search className="h-4 w-4" />
                    <span>Detecting document type</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Sparkles className="h-4 w-4" />
                    <span>Extracting dates and entities</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review Form (or Manual) */}
          {(step === "review" || step === "manual") && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-[var(--red)]/10 border border-[var(--red)]/20 text-[var(--red)] text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* AI Result Banner */}
              {step === "review" && analysisResult && (
                <div className="p-3 rounded-lg bg-[var(--purple)]/10 border border-[var(--purple)]/20">
                  <div className="flex items-center gap-2 text-[var(--purple)] mb-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      AI classified with {analysisResult.confidence} confidence
                    </span>
                  </div>
                  {analysisResult.summary && (
                    <p className="text-xs text-[var(--text-muted)]">{analysisResult.summary}</p>
                  )}
                </div>
              )}

              {/* File Size Warning */}
              {fileSizeWarning && (
                <div className="p-3 rounded-lg bg-[var(--yellow)]/10 border border-[var(--yellow)]/20 text-[var(--yellow)] text-sm">
                  {fileSizeWarning}
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
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Category
                  {analysisResult?.category && (
                    <span className="ml-2 text-xs text-[var(--purple)]">
                      AI: {getCategoryLabel(analysisResult.category)}
                    </span>
                  )}
                </label>
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
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Link to
                  {analysisResult?.entities?.horseName && (
                    <span className="ml-2 text-xs text-[var(--purple)]">
                      AI detected: {analysisResult.entities.horseName}
                    </span>
                  )}
                </label>
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

              {/* File URL (if file too large) */}
              {fileSizeWarning && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    <Link2 className="inline h-4 w-4 mr-1" />
                    File URL <span className="text-[var(--red)]">*</span>
                  </label>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="input"
                    required
                  />
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Document Date
                  </label>
                  <input
                    type="date"
                    value={documentDate}
                    onChange={(e) => setDocumentDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Expiry Date
                  </label>
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
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Issued By
                  </label>
                  <input
                    type="text"
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    placeholder="e.g., Allianz Insurance"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Reference Number
                  </label>
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
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Tags
                  {analysisResult?.suggestedTags?.length ? (
                    <span className="ml-2 text-xs text-[var(--purple)]">AI suggested</span>
                  ) : null}
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="insurance, annual, premium (comma separated)"
                  className="input"
                />
              </div>

              {/* Notes / Summary */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="input resize-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-[var(--border)] flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("drop")}
                  className="btn btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Document
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
