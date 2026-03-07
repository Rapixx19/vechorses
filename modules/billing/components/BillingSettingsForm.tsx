/**
 * FILE: modules/billing/components/BillingSettingsForm.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Form for editing billing and invoice settings including auto-invoicing
 * EXPORTS: BillingSettingsForm
 * DEPENDS ON: react-hook-form, zod, lib/types.ts
 * CONSUMED BY: app/settings/page.tsx
 * TESTS: modules/billing/tests/BillingSettingsForm.test.tsx
 * LAST CHANGED: 2026-03-07 — Added auto invoice scheduling section
 */

// 🔴 RED ZONE — billing settings form, handle with care

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Zap, Calendar, Mail } from "lucide-react"
import type { StableSettings, Service, Client } from "@/lib/types"

const schema = z.object({
  billingDayOfMonth: z.number().min(1).max(28),
  invoicePrefix: z.string().min(1, "Required"),
  invoiceStartNumber: z.number().min(1),
  currency: z.string().min(1, "Required"),
  bankName: z.string().optional(),
  bankIban: z.string().optional(),
  bankBic: z.string().optional(),
  invoiceNotes: z.string().optional(),
  invoiceFooter: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface BillingSettingsFormProps {
  settings: StableSettings
  onSave: (data: Partial<StableSettings>) => void
  services?: Service[]
  clients?: Client[]
}

export function BillingSettingsForm({ settings, onSave, services = [], clients = [] }: BillingSettingsFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      billingDayOfMonth: settings.billingDayOfMonth,
      invoicePrefix: settings.invoicePrefix,
      invoiceStartNumber: settings.invoiceStartNumber,
      currency: settings.currency,
      bankName: settings.bankName || "",
      bankIban: settings.bankIban || "",
      bankBic: settings.bankBic || "",
      invoiceNotes: settings.invoiceNotes || "",
      invoiceFooter: settings.invoiceFooter || "",
    },
  })

  // Auto invoice state
  const [autoEnabled, setAutoEnabled] = useState(settings.autoInvoiceEnabled || false)
  const [autoDay, setAutoDay] = useState(settings.autoInvoiceDay || 1)
  const [autoClients, setAutoClients] = useState<"all" | "selected">(settings.autoInvoiceClients || "all")
  const [autoServices, setAutoServices] = useState<string[]>(settings.autoInvoiceServices || [])
  const [autoEmail, setAutoEmail] = useState(settings.autoInvoiceEmailEnabled || false)

  // BREADCRUMB: Check if today is invoice day
  const today = new Date().getDate()
  const isInvoiceDay = autoEnabled && today === autoDay

  const inputClass = "w-full px-3 py-2 rounded-md bg-[#252538] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
  const labelClass = "block text-xs font-medium text-[var(--text-muted)] mb-1"
  const errorClass = "text-xs text-red-400 mt-1"

  const toggleService = (serviceId: string) => {
    setAutoServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleGenerateNow = async () => {
    try {
      const res = await fetch("/api/generate-invoices", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        alert(`Generated ${data.count} invoice(s) successfully!`)
      } else {
        alert(`Failed to generate invoices: ${data.error}`)
      }
    } catch {
      alert("Failed to generate invoices")
    }
  }

  const onSubmit = (data: FormData) => {
    onSave({
      ...data,
      autoInvoiceEnabled: autoEnabled,
      autoInvoiceDay: autoDay,
      autoInvoiceClients: autoClients,
      autoInvoiceServices: autoServices,
      autoInvoiceEmailEnabled: autoEmail,
    })
    alert("Billing settings saved successfully!")
  }

  // Calculate next invoice date
  const getNextInvoiceDate = () => {
    if (!autoEnabled) return null
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), autoDay)
    if (thisMonth > now) return thisMonth
    return new Date(now.getFullYear(), now.getMonth() + 1, autoDay)
  }

  const nextInvoiceDate = getNextInvoiceDate()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Invoice Day Banner */}
      {isInvoiceDay && (
        <div className="p-4 rounded-lg bg-green-900/20 border border-green-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-400">Today is invoice day!</p>
                <p className="text-xs text-gray-400">Generate invoices for all clients?</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGenerateNow}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-500"
            >
              Generate Now
            </button>
          </div>
        </div>
      )}

      {/* Auto Invoice Section */}
      <div className="p-4 rounded-lg bg-[#252538] border border-[var(--border)]">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-[#2C5F2E]" />
          <h4 className="text-sm font-medium text-[var(--text-primary)]">Auto Invoice</h4>
        </div>

        {/* Enable Toggle */}
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm text-gray-300">Automatically generate invoices</label>
          <button
            type="button"
            onClick={() => setAutoEnabled(!autoEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${autoEnabled ? "bg-green-600" : "bg-gray-600"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${autoEnabled ? "translate-x-5" : ""}`} />
          </button>
        </div>

        {autoEnabled && (
          <div className="space-y-4">
            {/* Day Selector */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Generate invoices on day</label>
              <div className="flex items-center gap-2">
                <select
                  value={autoDay}
                  onChange={(e) => setAutoDay(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-md bg-[#1A1A2E] border border-[var(--border)] text-sm text-white"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-400">of each month</span>
              </div>
            </div>

            {/* Client Selection */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Which clients</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAutoClients("all")}
                  className={`px-3 py-1.5 rounded text-xs font-medium ${autoClients === "all" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300"}`}
                >
                  All active clients
                </button>
                <button
                  type="button"
                  onClick={() => setAutoClients("selected")}
                  className={`px-3 py-1.5 rounded text-xs font-medium ${autoClients === "selected" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300"}`}
                >
                  Selected clients only
                </button>
              </div>
            </div>

            {/* Default Services */}
            {services.length > 0 && (
              <div>
                <label className="block text-xs text-gray-400 mb-2">Default services to include</label>
                <div className="flex flex-wrap gap-2">
                  {services.filter(s => s.isActive).map(service => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`px-2 py-1 rounded text-xs font-medium ${autoServices.includes(service.id) ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300"}`}
                    >
                      {service.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Email Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <label className="text-sm text-gray-300">Send invoice by email automatically</label>
              </div>
              <button
                type="button"
                onClick={() => setAutoEmail(!autoEmail)}
                className={`relative w-11 h-6 rounded-full transition-colors ${autoEmail ? "bg-green-600" : "bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${autoEmail ? "translate-x-5" : ""}`} />
              </button>
            </div>

            {/* Next Invoice Date */}
            {nextInvoiceDate && (
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="text-xs text-gray-400">
                  Next invoice date: <span className="text-white font-medium">{nextInvoiceDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invoice Settings */}
      <div>
        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">Invoice Generation</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Auto-generate invoices on day</label>
            <input type="number" min="1" max="28" {...register("billingDayOfMonth", { valueAsNumber: true })} className={inputClass} />
            {errors.billingDayOfMonth && <p className={errorClass}>{errors.billingDayOfMonth.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Invoice Prefix</label>
            <input {...register("invoicePrefix")} className={inputClass} placeholder="INV" />
            {errors.invoicePrefix && <p className={errorClass}>{errors.invoicePrefix.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Next Invoice Number</label>
            <input type="number" min="1" {...register("invoiceStartNumber", { valueAsNumber: true })} className={inputClass} />
            {errors.invoiceStartNumber && <p className={errorClass}>{errors.invoiceStartNumber.message}</p>}
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Default Currency</label>
          <select {...register("currency")} className={inputClass}>
            <option value="EUR">EUR - Euro</option>
            <option value="USD">USD - US Dollar</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CHF">CHF - Swiss Franc</option>
          </select>
        </div>
      </div>

      {/* Bank Details */}
      <div className="pt-4 border-t border-[var(--border)]">
        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">Bank Details (for invoices)</h4>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Bank Name</label>
            <input {...register("bankName")} className={inputClass} placeholder="e.g. Banca Intesa Sanpaolo" />
          </div>
          <div>
            <label className={labelClass}>IBAN</label>
            <input {...register("bankIban")} className={inputClass} placeholder="e.g. IT60 X054 2811 1010 0000 0123 456" />
          </div>
          <div>
            <label className={labelClass}>BIC / SWIFT</label>
            <input {...register("bankBic")} className={inputClass} placeholder="e.g. BCITITMM" />
          </div>
        </div>
      </div>

      {/* Invoice Text */}
      <div className="pt-4 border-t border-[var(--border)]">
        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">Invoice Text</h4>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Payment Notes (appears at bottom of every invoice)</label>
            <textarea {...register("invoiceNotes")} rows={2} className={inputClass} placeholder="e.g. Payment due within 30 days of invoice date" />
          </div>
          <div>
            <label className={labelClass}>Footer Message (thank you message on invoices)</label>
            <textarea {...register("invoiceFooter")} rows={2} className={inputClass} placeholder="e.g. Thank you for your trust in our stable" />
          </div>
        </div>
      </div>

      <button type="submit" className="w-full px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#2C5F2E" }}>
        Save Billing Settings
      </button>
    </form>
  )
}
