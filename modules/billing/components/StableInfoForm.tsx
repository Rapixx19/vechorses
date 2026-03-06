/**
 * FILE: modules/billing/components/StableInfoForm.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Form for editing stable information settings
 * EXPORTS: StableInfoForm
 * DEPENDS ON: react-hook-form, zod, lib/types.ts, lucide-react
 * CONSUMED BY: app/settings/page.tsx
 * TESTS: modules/billing/tests/StableInfoForm.test.tsx
 * LAST CHANGED: 2026-03-06 — Phase 7c: Added logo placeholder with horse icon
 */

// 🔴 RED ZONE — billing settings form, handle with care

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Hexagon } from "lucide-react"
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
      stableName: settings.stableName,
      ownerName: settings.ownerName,
      address: settings.address,
      city: settings.city,
      country: settings.country,
      phone: settings.phone,
      email: settings.email,
      vatNumber: settings.vatNumber || "",
    },
  })

  const inputClass = "w-full px-3 py-2 rounded-md bg-[#252538] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
  const labelClass = "block text-xs font-medium text-[var(--text-muted)] mb-1"
  const errorClass = "text-xs text-red-400 mt-1"

  const onSubmit = (data: FormData) => {
    onSave(data)
    alert("Stable info saved successfully!")
  }

  const handleLogoClick = () => {
    alert("Logo upload available in V2")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Logo Upload */}
      <div className="mb-6">
        <label className={labelClass}>Logo</label>
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center justify-center w-32 h-32 rounded-lg border-2 border-dashed border-[var(--border)] bg-[#252538] hover:border-[#2C5F2E] transition-colors"
        >
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
          ) : (
            <div className="flex flex-col items-center text-[var(--text-muted)]">
              <Hexagon className="h-10 w-10 mb-2" />
              <span className="text-xs">Upload Logo</span>
            </div>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Stable Name *</label>
          <input {...register("stableName")} className={inputClass} />
          {errors.stableName && <p className={errorClass}>{errors.stableName.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Owner Name *</label>
          <input {...register("ownerName")} className={inputClass} />
          {errors.ownerName && <p className={errorClass}>{errors.ownerName.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Address *</label>
        <input {...register("address")} className={inputClass} />
        {errors.address && <p className={errorClass}>{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>City *</label>
          <input {...register("city")} className={inputClass} />
          {errors.city && <p className={errorClass}>{errors.city.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Country *</label>
          <input {...register("country")} className={inputClass} />
          {errors.country && <p className={errorClass}>{errors.country.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Phone *</label>
          <input {...register("phone")} className={inputClass} />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" {...register("email")} className={inputClass} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>VAT Number (optional)</label>
        <input {...register("vatNumber")} className={inputClass} placeholder="e.g. IT12345678901" />
      </div>

      <button type="submit" className="w-full px-4 py-2 rounded-md text-sm font-medium text-white mt-6" style={{ backgroundColor: "#2C5F2E" }}>
        Save Stable Info
      </button>
    </form>
  )
}
