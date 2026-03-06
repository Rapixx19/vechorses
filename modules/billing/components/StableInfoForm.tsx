/**
 * FILE: modules/billing/components/StableInfoForm.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Form for editing stable information settings
 * EXPORTS: StableInfoForm
 * DEPENDS ON: react-hook-form, zod, lib/types.ts
 * CONSUMED BY: app/settings/page.tsx
 * TESTS: modules/billing/tests/StableInfoForm.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for Phase 7b
 */

// 🔴 RED ZONE — billing settings form, handle with care

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { StableSettings } from "@/lib/types"

const schema = z.object({
  stableName: z.string().min(1, "Required"),
  ownerName: z.string().min(1, "Required"),
  address: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  vatNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankIban: z.string().optional(),
  bankBic: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface StableInfoFormProps {
  settings: StableSettings
  onSave: (data: Partial<StableSettings>) => void
}

export function StableInfoForm({ settings, onSave }: StableInfoFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      stableName: settings.stableName, ownerName: settings.ownerName, address: settings.address,
      city: settings.city, country: settings.country, phone: settings.phone, email: settings.email,
      vatNumber: settings.vatNumber || "", bankName: settings.bankName || "",
      bankIban: settings.bankIban || "", bankBic: settings.bankBic || "",
    },
  })

  const inputClass = "w-full px-3 py-2 rounded-md bg-[#1A1A2E] border border-[var(--border)] text-sm text-[var(--text-primary)]"
  const labelClass = "block text-xs font-medium text-[var(--text-muted)] mb-1"
  const errorClass = "text-xs text-red-400 mt-1"

  const onSubmit = (data: FormData) => {
    onSave(data)
    alert("Settings saved successfully!")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>Stable Name *</label><input {...register("stableName")} className={inputClass} />{errors.stableName && <p className={errorClass}>{errors.stableName.message}</p>}</div>
        <div><label className={labelClass}>Owner Name *</label><input {...register("ownerName")} className={inputClass} />{errors.ownerName && <p className={errorClass}>{errors.ownerName.message}</p>}</div>
      </div>
      <div><label className={labelClass}>Address *</label><input {...register("address")} className={inputClass} />{errors.address && <p className={errorClass}>{errors.address.message}</p>}</div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>City *</label><input {...register("city")} className={inputClass} />{errors.city && <p className={errorClass}>{errors.city.message}</p>}</div>
        <div><label className={labelClass}>Country *</label><input {...register("country")} className={inputClass} />{errors.country && <p className={errorClass}>{errors.country.message}</p>}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>Phone *</label><input {...register("phone")} className={inputClass} />{errors.phone && <p className={errorClass}>{errors.phone.message}</p>}</div>
        <div><label className={labelClass}>Email *</label><input type="email" {...register("email")} className={inputClass} />{errors.email && <p className={errorClass}>{errors.email.message}</p>}</div>
      </div>
      <div><label className={labelClass}>VAT Number</label><input {...register("vatNumber")} className={inputClass} placeholder="Optional" /></div>
      <div className="pt-4 border-t border-[var(--border)]">
        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Bank Details</h4>
        <div className="space-y-3">
          <div><label className={labelClass}>Bank Name</label><input {...register("bankName")} className={inputClass} /></div>
          <div><label className={labelClass}>IBAN</label><input {...register("bankIban")} className={inputClass} /></div>
          <div><label className={labelClass}>BIC</label><input {...register("bankBic")} className={inputClass} /></div>
        </div>
      </div>
      <div className="pt-4 border-t border-[var(--border)]">
        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Logo</h4>
        <button type="button" onClick={() => alert("Logo upload in V2")} className="px-4 py-2 rounded text-sm bg-[#1A1A2E] text-[var(--text-muted)] hover:text-[var(--text-primary)]">Upload Logo</button>
      </div>
      <button type="submit" className="w-full px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#2C5F2E" }}>Save Settings</button>
    </form>
  )
}
