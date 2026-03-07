/**
 * FILE: modules/clients/components/ClientForm.tsx
 * ZONE: Green
 * PURPOSE: Add/Edit form for clients with GDPR consent
 * EXPORTS: ClientForm
 * DEPENDS ON: react-hook-form, zod
 * CONSUMED BY: app/clients/new/page.tsx, app/clients/[id]/edit/page.tsx
 * TESTS: modules/clients/tests/ClientForm.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Client } from "@/lib/types"

const clientSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  emergencyContactName: z.string(),
  emergencyContactPhone: z.string(),
  notes: z.string(),
  gdprConsent: z.boolean(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  initialData?: Client | null
  onSubmit: (data: ClientFormData & { gdprConsentAt?: string; gdprConsentVersion?: string }) => void
  isEditing?: boolean
}

export function ClientForm({ initialData, onSubmit, isEditing = false }: ClientFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: initialData?.fullName ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      emergencyContactName: initialData?.emergencyContactName ?? "",
      emergencyContactPhone: initialData?.emergencyContactPhone ?? "",
      notes: initialData?.notes ?? "",
      gdprConsent: !!initialData?.gdprConsentAt,
    },
  })

  const handleFormSubmit = (data: ClientFormData) => {
    // BREADCRUMB: New clients get GDPR consent timestamp on submit
    if (!isEditing && data.gdprConsent) {
      onSubmit({ ...data, gdprConsentAt: new Date().toISOString(), gdprConsentVersion: "1.0" })
    } else {
      onSubmit(data)
    }
  }

  const inputClass = "w-full px-3 py-3 min-h-[44px] rounded-md bg-[#1A1A2E] border border-[var(--border)] text-[var(--text-primary)] text-base focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
  const labelClass = "block text-sm font-medium text-[var(--text-primary)] mb-1"
  const errorClass = "text-xs text-red-400 mt-1"

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input {...register("fullName")} className={inputClass} placeholder="John Smith" />
          {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" inputMode="email" autoComplete="email" {...register("email")} className={inputClass} placeholder="john@example.com" />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Phone *</label>
          <input type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} className={inputClass} placeholder="+39 123 456 7890" />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
      </div>

      <h3 className="text-sm font-medium text-[var(--text-muted)] pt-2">Emergency Contact</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name</label>
          <input {...register("emergencyContactName")} className={inputClass} placeholder="Emergency contact name" />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input type="tel" inputMode="tel" {...register("emergencyContactPhone")} className={inputClass} placeholder="Emergency contact phone" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea {...register("notes")} rows={3} className={inputClass} placeholder="Additional notes..." />
      </div>

      {!isEditing && (
        <div className="flex items-start gap-3 p-4 rounded-md border border-[var(--border)]">
          <input type="checkbox" {...register("gdprConsent")} className="mt-1 w-5 h-5 min-w-[20px]" />
          <label className="text-sm text-[var(--text-muted)]">
            I consent to my personal data being stored for stable management purposes *
          </label>
        </div>
      )}

      <button type="submit" className="w-full sm:w-auto px-6 py-3 min-h-[44px] rounded-md text-white font-medium" style={{ backgroundColor: "#2C5F2E" }}>
        {isEditing ? "Save Changes" : "Add Client"}
      </button>
    </form>
  )
}
