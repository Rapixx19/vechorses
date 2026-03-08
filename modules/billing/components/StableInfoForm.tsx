/**
 * FILE: modules/billing/components/StableInfoForm.tsx
 * ZONE: Red
 * PURPOSE: Form for editing stable information settings with logo upload
 * EXPORTS: StableInfoForm
 * DEPENDS ON: react-hook-form, zod, lib/types.ts, lucide-react
 * CONSUMED BY: app/settings/page.tsx
 * TESTS: modules/billing/tests/StableInfoForm.test.tsx
 * LAST CHANGED: 2026-03-08 — Added logo upload with base64, website field, save feedback
 */

// RED ZONE — billing settings form, handle with care

"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Hexagon, Upload, X, Loader2, Check } from "lucide-react"
import type { StableSettings } from "@/lib/types"

const schema = z.object({
  stableName: z.string().min(1, "Required"),
  ownerName: z.string().min(1, "Required"),
  address: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  vatNumber: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface StableInfoFormProps {
  settings: StableSettings
  onSave: (data: Partial<StableSettings>) => Promise<void>
}

export function StableInfoForm({ settings, onSave }: StableInfoFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoData || settings.logoUrl || null)
  const [logoData, setLogoData] = useState<string | null>(settings.logoData || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      stableName: settings.stableName,
      ownerName: settings.ownerName,
      address: settings.address,
      city: settings.city,
      country: settings.country,
      phone: settings.phone,
      email: settings.email,
      website: settings.website || "",
      vatNumber: settings.vatNumber || "",
    },
  })

  // Reset form when settings change (e.g., after fetch)
  useEffect(() => {
    reset({
      stableName: settings.stableName,
      ownerName: settings.ownerName,
      address: settings.address,
      city: settings.city,
      country: settings.country,
      phone: settings.phone,
      email: settings.email,
      website: settings.website || "",
      vatNumber: settings.vatNumber || "",
    })
    setLogoPreview(settings.logoData || settings.logoUrl || null)
    setLogoData(settings.logoData || null)
  }, [settings, reset])

  const inputClass =
    "w-full px-3 py-2 rounded-md bg-[#252538] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
  const labelClass = "block text-xs font-medium text-[var(--text-muted)] mb-1"
  const errorClass = "text-xs text-red-400 mt-1"

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setSaveError("Please select an image file")
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setSaveError("Image must be less than 2MB")
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setLogoPreview(base64)
      setLogoData(base64)
      setSaveError(null)
    }
    reader.onerror = () => {
      setSaveError("Failed to read image file")
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setLogoData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await onSave({
        ...data,
        logoData: logoData || undefined,
      })
      setSaveSuccess(true)
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Logo Upload */}
      <div className="mb-6">
        <label className={labelClass}>Logo</label>
        <div className="flex items-start gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center w-32 h-32 rounded-lg border-2 border-dashed border-[var(--border)] bg-[#252538] hover:border-[#2C5F2E] transition-colors overflow-hidden"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center text-[var(--text-muted)]">
                  <Hexagon className="h-10 w-10 mb-2" />
                  <span className="text-xs">Upload Logo</span>
                </div>
              )}
            </button>
            {logoPreview && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[var(--text-muted)] border border-[var(--border)] hover:border-[#2C5F2E] transition-colors"
            >
              <Upload className="h-4 w-4" />
              Choose Image
            </button>
            <p className="text-xs text-[var(--text-muted)] mt-2">PNG, JPG up to 2MB. Will appear on invoices.</p>
          </div>
        </div>
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
        <label className={labelClass}>Website (optional)</label>
        <input {...register("website")} className={inputClass} placeholder="https://www.yourstable.com" />
        {errors.website && <p className={errorClass}>{errors.website.message}</p>}
      </div>

      <div>
        <label className={labelClass}>VAT Number (optional)</label>
        <input {...register("vatNumber")} className={inputClass} placeholder="e.g. IT12345678901" />
      </div>

      {/* Save Feedback */}
      {saveError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{saveError}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
          <Check className="h-4 w-4 text-green-400" />
          <p className="text-sm text-green-400">Stable info saved successfully</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full px-4 py-2 rounded-md text-sm font-medium text-white mt-6 flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
        style={{ backgroundColor: "#2C5F2E" }}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Stable Info"
        )}
      </button>
    </form>
  )
}
