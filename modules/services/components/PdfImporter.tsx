/**
 * FILE: modules/services/components/PdfImporter.tsx
 * ZONE: Green
 * PURPOSE: 4-step dialog for importing services from PDF via Claude API
 * EXPORTS: PdfImporter
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: ServiceGrid
 * TESTS: modules/services/tests/PdfImporter.test.tsx
 * LAST CHANGED: 2026-03-07 — Improved for Italian/Swiss price lists with irregular formatting
 */

"use client"

import { useState, useCallback } from "react"
import { X, Upload, Loader2, CheckCircle, Trash2, Edit2, Globe, AlertCircle, Coins } from "lucide-react"
import type { Service, ServiceCategory, ServiceUnit } from "@/lib/types"

type ExtractedService = Omit<Service, "id" | "createdAt"> & { originalName?: string; vatRate?: number }

interface ExtractionResult {
  services: ExtractedService[]
  detectedLanguage: string
  detectedCurrency: string
  confidence: "high" | "medium" | "low"
  rawResponse?: string
}

interface PdfImporterProps {
  onClose: () => void
  onImport: (services: Omit<Service, "id" | "createdAt">[]) => void
}

// BREADCRUMB: System prompt for Claude API - handles Italian/Swiss/German stable documents
const SYSTEM_PROMPT = `You are an expert at extracting service price lists from horse stable documents. Documents may be in Italian, German, French, Spanish, or English.

EXTRACTION RULES:
1. Extract EVERY service/product line item
2. Handle Swiss number format: 1'365.00 → 136500 (cents)
3. Handle European format: 1.365,00 → 136500 (cents)
4. Handle standard format: 1365.00 → 136500 (cents)
5. All prices stored as INTEGER CENTS
6. If price says "da definire" or "TBD" or "auf Anfrage" → use 0
7. Currency: detect CHF, EUR, USD, GBP etc.
8. Duration/unit: extract "al mese", "a volta", "per anno", "al giorno", "50 min" as unitLabel
9. IVA/VAT %: extract if present as vatRate number
10. Multi-price services: create separate entry for each price point (e.g., monthly AND daily rates)
11. Translate names to English, keep original in originalName

CATEGORY MAPPING:
- Pensione cavallo/Pferdepension/Horse boarding → boarding
- Lezione/Unterricht/Lesson → lessons
- Lavoro alla corda/Longe/Lunging → training
- Lavoro cavallo montato/Reitarbeit → training
- Maniscalco/Ferratura/Hufschmied/Farrier → farrier
- Veterinario/Tierarzt/Vet → vet
- Tosatura/Scheren/Grooming → grooming
- Trasporti/Transport → other
- Concorsi/Turniere/Competition → competitions
- Pascoli/Weide/Pasture → boarding
- Fieno/Mangime/Heu/Futter/Feed → feed
- Giostra/Führanlage/Horse walker → training
- Arena/Halle/Indoor arena → training

Return ONLY this exact JSON format:
{
  "services": [
    {
      "name": "Horse Boarding",
      "originalName": "Pensione cavallo",
      "description": "Monthly horse boarding",
      "category": "boarding",
      "price": 136500,
      "currency": "CHF",
      "unit": "per_month",
      "unitLabel": "month",
      "vatRate": 8.1
    }
  ],
  "detectedLanguage": "Italian",
  "currency": "CHF",
  "confidence": "high"
}

IMPORTANT: Return ONLY the JSON object.
No markdown, no explanation, no code blocks.
Do not wrap in \`\`\`json code blocks.`

// BREADCRUMB: Extract JSON from response text, handles markdown code blocks
function extractJsonFromText(text: string): string {
  const trimmed = text.trim()

  // If already starts with {, return as-is
  if (trimmed.startsWith("{")) return trimmed

  // Try to find JSON in markdown code blocks
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) return codeBlockMatch[1].trim()

  // Try to find JSON object directly
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
  if (jsonMatch) return jsonMatch[0]

  return trimmed
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
      price: typeof s.price === "number" ? Math.round(s.price) : 0,
      currency: String(s.currency || parsed.currency || "EUR"),
      unit: validateUnit(String(s.unit || "per_session")),
      unitLabel: s.unitLabel ? String(s.unitLabel) : undefined,
      vatRate: typeof s.vatRate === "number" ? s.vatRate : undefined,
      isActive: true,
    }))

    return {
      services,
      detectedLanguage: String(parsed.detectedLanguage || "Unknown"),
      detectedCurrency: String(parsed.currency || services[0]?.currency || "EUR"),
      confidence: validateConfidence(parsed.confidence),
    }
  } catch {
    // Return error with raw response for debugging
    throw new ParseError("Failed to parse extraction result", responseText)
  }
}

class ParseError extends Error {
  rawResponse: string
  constructor(message: string, rawResponse: string) {
    super(message)
    this.rawResponse = rawResponse
  }
}

function validateCategory(cat: string): ServiceCategory {
  const valid: ServiceCategory[] = ["boarding", "lessons", "farrier", "vet", "grooming", "training", "competitions", "feed", "other"]
  return valid.includes(cat as ServiceCategory) ? (cat as ServiceCategory) : "other"
}

function validateUnit(unit: string): ServiceUnit {
  const mapping: Record<string, ServiceUnit> = {
    "per_month": "per_month",
    "per month": "per_month",
    "al mese": "per_month",
    "pro Monat": "per_month",
    "per_day": "per_day",
    "per day": "per_day",
    "al giorno": "per_day",
    "pro Tag": "per_day",
    "per_session": "per_session",
    "per session": "per_session",
    "a volta": "per_session",
    "pro Einheit": "per_session",
    "per_visit": "per_visit",
    "per visit": "per_visit",
    "per_item": "per_item",
    "per item": "per_item",
    "custom": "custom",
  }
  return mapping[unit.toLowerCase()] || "per_session"
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

  // Clean up PDF binary content - extract readable text, preserve numbers
  const extractedText = rawText
    .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t']/g, " ") // Keep apostrophe for Swiss numbers
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15000) // Increased limit for longer price lists

  if (extractedText.length < 50) {
    throw new Error("Could not extract readable text from PDF. Try a text-based PDF.")
  }

  const userPrompt = `Extract all services and prices from this horse stable price list.
The document may be in Italian, German, French, or English.
Handle Swiss number format (1'365.00) and European format (1.365,00).
Create separate entries for services with multiple price points.
Translate names to English but keep originals.
Return ONLY valid JSON, no markdown.

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
  const [detectedCurrency, setDetectedCurrency] = useState<string>("EUR")
  const [confidence, setConfidence] = useState<"high" | "medium" | "low">("medium")
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.includes("pdf")) {
      setError("Please upload a PDF file")
      return
    }
    setError(null)
    setRawResponse(null)
    setStep(2)

    try {
      const result = await extractServicesFromPdf(file)
      setExtracted(result.services)
      setDetectedLanguage(result.detectedLanguage)
      setDetectedCurrency(result.detectedCurrency)
      setConfidence(result.confidence)
      setStep(3)
    } catch (err) {
      if (err instanceof ParseError) {
        setError(err.message)
        setRawResponse(err.rawResponse)
      } else {
        setError(err instanceof Error ? err.message : "Failed to extract services")
      }
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
    // Remove originalName and vatRate before importing
    const cleaned = extracted.map((svc) => {
      const { originalName, vatRate, ...rest } = svc
      void originalName
      void vatRate
      return rest
    })
    onImport(cleaned)
    setStep(4)
    setTimeout(onClose, 1500)
  }

  const formatPrice = (cents: number, currency: string) => {
    const symbol = currency === "CHF" ? "CHF " : currency === "USD" ? "$" : currency === "GBP" ? "£" : "€"
    return `${symbol}${(cents / 100).toFixed(2)}`
  }

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
            <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
              {rawResponse && (
                <details className="mt-2">
                  <summary className="text-xs text-red-400/70 cursor-pointer">Show raw response</summary>
                  <pre className="mt-2 p-2 rounded bg-black/30 text-xs text-red-400/70 overflow-x-auto max-h-32 overflow-y-auto">
                    {rawResponse.slice(0, 500)}
                  </pre>
                </details>
              )}
            </div>
          )}

          {step === 1 && (
            <label className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragOver ? "border-[#2C5F2E] bg-[#2C5F2E]/10" : "border-[#3A3A52] hover:border-[#2C5F2E]"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
              <Upload className="h-10 w-10 text-[var(--text-muted)] mb-3" />
              <span className="text-sm text-[var(--text-primary)] mb-1">Drop your PDF here or click to upload</span>
              <span className="text-xs text-[var(--text-muted)]">Supports Italian, German, French, Spanish, English</span>
              <span className="text-xs text-[var(--text-muted)]">Handles CHF, EUR and Swiss number formats</span>
              <input type="file" accept=".pdf" onChange={handleChange} className="hidden" />
            </label>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center justify-center h-48">
              <Loader2 className="h-10 w-10 text-[#2C5F2E] animate-spin mb-4" />
              <span className="text-sm text-[var(--text-primary)]">Processing document...</span>
              <span className="text-xs text-[var(--text-muted)] mt-1">This may take a moment</span>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {/* Language, currency and confidence info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-primary)]">{detectedLanguage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-primary)]">{detectedCurrency}</span>
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
                          <p className="text-xs text-[var(--text-muted)]">
                            {svc.category} • {formatPrice(svc.price, svc.currency)}
                            {svc.unitLabel && ` / ${svc.unitLabel}`}
                            {svc.vatRate && ` (${svc.vatRate}% VAT)`}
                          </p>
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
