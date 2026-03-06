/**
 * FILE: modules/billing/components/BillingSettingsForm.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Form for editing billing-specific settings
 * EXPORTS: BillingSettingsForm
 * DEPENDS ON: react-hook-form, zod, lib/types.ts
 * CONSUMED BY: app/settings/page.tsx
 * TESTS: modules/billing/tests/BillingSettingsForm.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for Phase 7b
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
      invoiceNotes: settings.invoiceNotes || "",
      invoiceFooter: settings.invoiceFooter || "",
    },
  })

  const inputClass = "w-full px-3 py-2 rounded-md bg-[#1A1A2E] border border-[var(--border)] text-sm text-[var(--text-primary)]"
  const labelClass = "block text-xs font-medium text-[var(--text-muted)] mb-1"
  const errorClass = "text-xs text-red-400 mt-1"

  const onSubmit = (data: FormData) => {
    onSave(data)
    alert("Billing settings saved successfully!")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Billing Day of Month *</label>
          <input type="number" min="1" max="28" {...register("billingDayOfMonth", { valueAsNumber: true })} className={inputClass} />
          {errors.billingDayOfMonth && <p className={errorClass}>{errors.billingDayOfMonth.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Invoice Prefix *</label>
          <input {...register("invoicePrefix")} className={inputClass} placeholder="INV" />
          {errors.invoicePrefix && <p className={errorClass}>{errors.invoicePrefix.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Start Number *</label>
          <input type="number" min="1" {...register("invoiceStartNumber", { valueAsNumber: true })} className={inputClass} />
          {errors.invoiceStartNumber && <p className={errorClass}>{errors.invoiceStartNumber.message}</p>}
        </div>
      </div>
      <div>
        <label className={labelClass}>Default Currency *</label>
        <select {...register("currency")} className={inputClass}>
          <option value="EUR">EUR - Euro</option>
          <option value="USD">USD - US Dollar</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="CHF">CHF - Swiss Franc</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Invoice Notes</label>
        <textarea {...register("invoiceNotes")} rows={3} className={inputClass} placeholder="Payment terms, instructions..." />
      </div>
      <div>
        <label className={labelClass}>Invoice Footer</label>
        <textarea {...register("invoiceFooter")} rows={2} className={inputClass} placeholder="Thank you message..." />
      </div>
      <button type="submit" className="w-full px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#2C5F2E" }}>Save Billing Settings</button>
    </form>
  )
}
