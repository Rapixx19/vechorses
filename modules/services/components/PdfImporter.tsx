/**
 * FILE: modules/services/components/PdfImporter.tsx
 * ZONE: Green
 * PURPOSE: 4-step dialog for importing services from PDF via Claude API
 * EXPORTS: PdfImporter
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: ServiceGrid
 * TESTS: modules/services/tests/PdfImporter.test.tsx
 * LAST CHANGED: 2026-03-07 — Improved Claude API prompts for multi-language support
 */

"use client"

import { useState, useCallback } from "react"
import { X, Upload, Loader2, CheckCircle, Trash2, Edit2, Globe, AlertCircle } from "lucide-react"
import type { Service, ServiceCategory, ServiceUnit } from "@/lib/types"

type ExtractedService = Omit<Service, "id" | "createdAt"> & { originalName?: string }

interface ExtractionResult {
  services: ExtractedService[]
  detectedLanguage: string
  confidence: "high" | "medium" | "low"
}

interface PdfImporterProps {
  onClose: () => void
  onImport: (services: Omit<Service, "id" | "createdAt">[]) => void
}

// BREADCRUMB: System prompt for Claude API - handles multi-language extraction
const SYSTEM_PROMPT = `You are an expert at extracting service/product listings from documents in ANY language (Italian, German, French, Spanish, English, etc.).

Your job is to extract ALL services, treatments, lessons, or products from the provided document and return them as structured JSON.

Rules:
1. Detect the language automatically
2. Translate all service names to English
3. Keep original name in a "originalName" field
4. Extract price if present (convert to cents/integer)
5. Detect currency (EUR, USD, GBP, CHF etc.)
6. Categorize each service as one of: boarding | lessons | farrier | vet | grooming | training | competitions | feed | other
7. Extract unit if present (per_day, per_session, per_month, per_visit, per_item, custom)
8. If price is a range, use the lower price

Return ONLY valid JSON in this exact format:
{
  "services": [
    {
      "name": "English service name",
      "originalName": "Name in original language",
      "description": "Brief description in English",
      "category": "one of the categories above",
      "price": 5000,
      "currency": "EUR",
      "unit": "per_session",
      "unitLabel": "session"
    }
  ],
  "detectedLanguage": "Italian",
  "confidence": "high"
}

Do NOT include any text outside the JSON.
Do NOT include markdown code blocks.
If you cannot extract a price, use 0.
If you cannot determine category, use "other".`

// BREADCRUMB: Extract JSON from response text, handles markdown code blocks
function extractJsonFromText(text: string): string {
  // Try to find JSON in markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) return codeBlockMatch[1].trim()

  // Try to find JSON object directly
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) return jsonMatch[0]

  return text
}

// BREADCRUMB: Parse Claude API response with error recovery
function parseExtractionResult(responseText: string): ExtractionResult {
  const jsonText = extractJsonFromText(responseText)

  try {
    const parsed = JSON.parse(jsonText)

    // Validate and normalize services
    const services: ExtractedService[] = (parsed.services || []).map((s: Record<string, unknown>) => ({
      name: String(s.name || "Unknown Service"),
      originalName: s.originalName ? String(s.originalName) : undefined,
      description: String(s.description || ""),
      category: validateCategory(String(s.category || "other")),
      price: typeof s.price === "number" ? s.price : 0,
      currency: String(s.currency || "EUR"),
      unit: validateUnit(String(s.unit || "per_session")),
      unitLabel: s.unitLabel ? String(s.unitLabel) : undefined,
      isActive: true,
    }))

    return {
      services,
      detectedLanguage: String(parsed.detectedLanguage || "Unknown"),
      confidence: validateConfidence(parsed.confidence),
    }
  } catch {
    throw new Error("Failed to parse extraction result. Please try again.")
  }
}

function validateCategory(cat: string): ServiceCategory {
  const valid: ServiceCategory[] = ["boarding", "lessons", "farrier", "vet", "grooming", "training", "competitions", "feed", "other"]
  return valid.includes(cat as ServiceCategory) ? (cat as ServiceCategory) : "other"
}

function validateUnit(unit: string): ServiceUnit {
  const valid: ServiceUnit[] = ["per_month", "per_session", "per_day", "per_visit", "per_item", "custom"]
  return valid.includes(unit as ServiceUnit) ? (unit as ServiceUnit) : "per_session"
}

function validateConfidence(conf: unknown): "high" | "medium" | "low" {
  if (conf === "high" || conf === "medium" || conf === "low") return conf
  return "medium"
}

// BREADCRUMB: Call Claude API to extract services from PDF text
async function extractServicesFromPdf(file: File): Promise<ExtractionResult> {
  // Extract text from PDF using browser FileReader
  const arrayBuffer = await file.arrayBuffer()
  const textDecoder = new TextDecoder("utf-8")
  const rawText = textDecoder.decode(arrayBuffer)

  // Clean up PDF binary content - extract readable text
  const extractedText = rawText
    .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 10000) // Limit to first 10k chars

  if (extractedText.length < 50) {
    throw new Error("Could not extract readable text from PDF. Try a text-based PDF.")
  }

  const userPrompt = `Extract all services from this document. The document may be in any language.
Translate names to English but keep originals.
Return only JSON.

Document content:
${extractedText}`

  const response = await fetch("/api/extract-services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt: SYSTEM_PROMPT, userPrompt }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || "Failed to analyze PDF")
  }

  const data = await response.json()
  return parseExtractionResult(data.content)
}

export function PdfImporter({ onClose, onImport }: PdfImporterProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [extracted, setExtracted] = useState<ExtractedService[]>([])
  const [detectedLanguage, setDetectedLanguage] = useState<string>("")
  const [confidence, setConfidence] = useState<"high" | "medium" | "low">("medium")
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.includes("pdf")) {
      setError("Please upload a PDF file")
      return
    }
    setError(null)
    setStep(2)

    try {
      const result = await extractServicesFromPdf(file)
      setExtracted(result.services)
      setDetectedLanguage(result.detectedLanguage)
      setConfidence(result.confidence)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract services")
      setStep(1)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleRemove = (idx: number) => setExtracted((prev) => prev.filter((_, i) => i !== idx))

  const handleEdit = (idx: number, updates: Partial<ExtractedService>) => {
    setExtracted((prev) => prev.map((s, i) => (i === idx ? { ...s, ...updates } : s)))
  }

  const handleConfirm = () => {
    // Remove originalName before importing
    const cleaned = extracted.map((svc) => {
      const { originalName, ...rest } = svc
      void originalName // Explicitly mark as intentionally unused
      return rest
    })
    onImport(cleaned)
    setStep(4)
    setTimeout(onClose, 1500)
  }

  const formatPrice = (cents: number) => `€${(cents / 100).toFixed(2)}`
  const confidenceColor = confidence === "high" ? "text-green-400" : confidence === "medium" ? "text-yellow-400" : "text-red-400"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#1A1A2E] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#252538]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Import Services from PDF</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#252538]"><X className="h-5 w-5 text-[var(--text-muted)]" /></button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {step === 1 && (
            <label className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragOver ? "border-[#2C5F2E] bg-[#2C5F2E]/10" : "border-[#3A3A52] hover:border-[#2C5F2E]"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
              <Upload className="h-10 w-10 text-[var(--text-muted)] mb-3" />
              <span className="text-sm text-[var(--text-primary)] mb-1">Drop your PDF here or click to upload</span>
              <span className="text-xs text-[var(--text-muted)]">Supports any language: Italian, German, French, Spanish, English...</span>
              <input type="file" accept=".pdf" onChange={handleChange} className="hidden" />
            </label>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center justify-center h-48">
              <Loader2 className="h-10 w-10 text-[#2C5F2E] animate-spin mb-4" />
              <span className="text-sm text-[var(--text-primary)]">Analysing with Claude...</span>
              <span className="text-xs text-[var(--text-muted)] mt-1">Detecting language and extracting services</span>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {/* Language and confidence info */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-muted)]">Detected:</span>
                  <span className="text-[var(--text-primary)]">{detectedLanguage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)]">Confidence:</span>
                  <span className={confidenceColor}>{confidence}</span>
                </div>
              </div>

              <p className="text-sm text-[var(--text-muted)]">Found {extracted.length} services. Click to edit before importing:</p>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {extracted.map((svc, idx) => (
                  <div key={idx} className="p-3 rounded-md bg-[#252538]">
                    {editingIdx === idx ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={svc.name}
                          onChange={(e) => handleEdit(idx, { name: e.target.value })}
                          className="w-full px-2 py-1 rounded bg-[#1A1A2E] border border-[#3A3A52] text-sm text-[var(--text-primary)]"
                          placeholder="Service name"
                        />
                        <input
                          type="number"
                          value={svc.price / 100}
                          onChange={(e) => handleEdit(idx, { price: Math.round(parseFloat(e.target.value) * 100) || 0 })}
                          className="w-full px-2 py-1 rounded bg-[#1A1A2E] border border-[#3A3A52] text-sm text-[var(--text-primary)]"
                          placeholder="Price"
                          step="0.01"
                        />
                        <select
                          value={svc.category}
                          onChange={(e) => handleEdit(idx, { category: e.target.value as ServiceCategory })}
                          className="w-full px-2 py-1 rounded bg-[#1A1A2E] border border-[#3A3A52] text-sm text-[var(--text-primary)]"
                        >
                          <option value="boarding">Boarding</option>
                          <option value="lessons">Lessons</option>
                          <option value="farrier">Farrier</option>
                          <option value="vet">Vet</option>
                          <option value="grooming">Grooming</option>
                          <option value="training">Training</option>
                          <option value="competitions">Competitions</option>
                          <option value="feed">Feed</option>
                          <option value="other">Other</option>
                        </select>
                        <button onClick={() => setEditingIdx(null)} className="w-full px-2 py-1 rounded text-sm font-medium text-white" style={{ backgroundColor: "#2C5F2E" }}>Done</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{svc.name}</p>
                          {svc.originalName && svc.originalName !== svc.name && (
                            <p className="text-xs text-[var(--text-muted)] truncate italic">({svc.originalName})</p>
                          )}
                          <p className="text-xs text-[var(--text-muted)]">{svc.category} • {formatPrice(svc.price)}</p>
                        </div>
                        <button onClick={() => setEditingIdx(idx)} className="p-1.5 rounded hover:bg-[#1A1A2E] text-blue-400"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleRemove(idx)} className="p-1.5 rounded hover:bg-[#1A1A2E] text-red-400"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 px-4 py-2 rounded-md text-sm font-medium bg-[#252538] text-[var(--text-primary)] hover:bg-[#3A3A52]">Cancel</button>
                <button onClick={handleConfirm} disabled={extracted.length === 0} className="flex-1 px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: "#2C5F2E" }}>Import {extracted.length} Services</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center h-48">
              <CheckCircle className="h-12 w-12 text-[#2C5F2E] mb-4" />
              <span className="text-sm text-[var(--text-primary)]">Successfully imported!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
