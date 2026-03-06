/**
 * FILE: modules/billing/components/BillingSettingsForm.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Form for editing billing and invoice settings
 * EXPORTS: BillingSettingsForm
 * DEPENDS ON: react-hook-form, zod, lib/types.ts
 * CONSUMED BY: app/settings/page.tsx
 * TESTS: modules/billing/tests/BillingSettingsForm.test.tsx
 * LAST CHANGED: 2026-03-06 — Phase 7c: Added bank details and improved labels
 */

// 🔴 RED ZONE — billing settings form, handle with care

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { StableSettings } from "@/lib/types"

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
}

export function BillingSettingsForm({ settings, onSave }: BillingSettingsFormProps) {
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

  const inputClass = "w-full px-3 py-2 rounded-md bg-[#252538] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
  const labelClass = "block text-xs font-medium text-[var(--text-muted)] mb-1"
  const errorClass = "text-xs text-red-400 mt-1"

  const onSubmit = (data: FormData) => {
    onSave(data)
    alert("Billing settings saved successfully!")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
