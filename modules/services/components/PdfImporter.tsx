/**
 * FILE: modules/services/components/PdfImporter.tsx
 * ZONE: Green
 * PURPOSE: 4-step dialog for importing services from PDF via Claude API
 * EXPORTS: PdfImporter
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: ServiceGrid
 * TESTS: modules/services/tests/PdfImporter.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for service management
 */

"use client"

import { useState, useCallback } from "react"
import { X, Upload, Loader2, CheckCircle, Trash2 } from "lucide-react"
import type { Service, ServiceCategory, ServiceUnit } from "@/lib/types"

type ExtractedService = Omit<Service, "id" | "createdAt">

interface PdfImporterProps {
  onClose: () => void
  onImport: (services: ExtractedService[]) => void
}

// Mock extraction - in production, this would call Claude API
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function extractServicesFromPdf(file: File): Promise<ExtractedService[]> {
  await new Promise((r) => setTimeout(r, 2000)) // Simulate API call
  return [
    { name: "Arena Rental", description: "Indoor arena rental for 1 hour", category: "training" as ServiceCategory, price: 3500, currency: "EUR", unit: "per_session" as ServiceUnit, isActive: true },
    { name: "Horse Walker", description: "30 minute session on automatic horse walker", category: "training" as ServiceCategory, price: 1500, currency: "EUR", unit: "per_session" as ServiceUnit, isActive: true },
    { name: "Tack Cleaning", description: "Full saddle and bridle cleaning service", category: "grooming" as ServiceCategory, price: 2500, currency: "EUR", unit: "per_item" as ServiceUnit, isActive: true },
  ]
}

export function PdfImporter({ onClose, onImport }: PdfImporterProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [extracted, setExtracted] = useState<ExtractedService[]>([])
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.includes("pdf")) return
    setStep(2)
    const services = await extractServicesFromPdf(file)
    setExtracted(services)
    setStep(3)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file) }, [handleFile])
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleFile(file) }, [handleFile])
  const handleRemove = (idx: number) => setExtracted((prev) => prev.filter((_, i) => i !== idx))
  const handleConfirm = () => { onImport(extracted); setStep(4); setTimeout(onClose, 1500) }

  const formatPrice = (cents: number) => `€${(cents / 100).toFixed(2)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#1A1A2E] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#252538]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Import Services from PDF</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#252538]"><X className="h-5 w-5 text-[var(--text-muted)]" /></button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <label className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragOver ? "border-[#2C5F2E] bg-[#2C5F2E]/10" : "border-[#3A3A52] hover:border-[#2C5F2E]"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
              <Upload className="h-10 w-10 text-[var(--text-muted)] mb-3" />
              <span className="text-sm text-[var(--text-primary)] mb-1">Drop your PDF here or click to upload</span>
              <span className="text-xs text-[var(--text-muted)]">Supported: PDF price lists, service catalogues</span>
              <input type="file" accept=".pdf" onChange={handleChange} className="hidden" />
            </label>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center justify-center h-48">
              <Loader2 className="h-10 w-10 text-[#2C5F2E] animate-spin mb-4" />
              <span className="text-sm text-[var(--text-primary)]">Analysing with Claude...</span>
              <span className="text-xs text-[var(--text-muted)] mt-1">Extracting service information from PDF</span>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-muted)]">Found {extracted.length} services. Review and edit before importing:</p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {extracted.map((svc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-md bg-[#252538]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{svc.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{svc.category} • {formatPrice(svc.price)}</p>
                    </div>
                    <button onClick={() => handleRemove(idx)} className="p-1.5 rounded hover:bg-[#1A1A2E] text-red-400"><Trash2 className="h-4 w-4" /></button>
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
