/**
 * FILE: modules/services/components/ServiceForm.tsx
 * ZONE: Green
 * PURPOSE: Sheet form for adding/editing services
 * EXPORTS: ServiceForm
 * DEPENDS ON: react-hook-form, zod, lib/types.ts
 * CONSUMED BY: ServiceGrid
 * TESTS: modules/services/tests/ServiceForm.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for service management
 */

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"
import type { Service, ServiceCategory, ServiceUnit } from "@/lib/types"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["boarding", "lessons", "farrier", "vet", "grooming", "training", "competitions", "feed", "other"]),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  currency: z.enum(["EUR", "USD", "GBP", "CHF"]),
  unit: z.enum(["per_month", "per_session", "per_day", "per_visit", "per_item", "custom"]),
  unitLabel: z.string().optional(),
  photoUrl: z.string().optional(),
  isActive: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface ServiceFormProps {
  initialData: Service | null
  isEditing: boolean
  onSubmit: (data: Omit<Service, "id" | "createdAt">) => void
  onClose: () => void
}

const categories: { value: ServiceCategory; label: string }[] = [
  { value: "boarding", label: "Boarding" }, { value: "lessons", label: "Lessons" }, { value: "farrier", label: "Farrier" },
  { value: "vet", label: "Vet" }, { value: "grooming", label: "Grooming" }, { value: "training", label: "Training" },
  { value: "competitions", label: "Competitions" }, { value: "feed", label: "Feed" }, { value: "other", label: "Other" },
]

const currencies = ["EUR", "USD", "GBP", "CHF"]
const units: { value: ServiceUnit; label: string }[] = [
  { value: "per_month", label: "Per Month" }, { value: "per_session", label: "Per Session" }, { value: "per_day", label: "Per Day" },
  { value: "per_visit", label: "Per Visit" }, { value: "per_item", label: "Per Item" }, { value: "custom", label: "Custom" },
]

export function ServiceForm({ initialData, isEditing, onSubmit, onClose }: ServiceFormProps) {
  const defaults: FormData = initialData
    ? { name: initialData.name, category: initialData.category, description: initialData.description || "", price: initialData.price / 100, currency: initialData.currency as "EUR" | "USD" | "GBP" | "CHF", unit: initialData.unit, unitLabel: initialData.unitLabel || "", photoUrl: initialData.photoUrl || "", isActive: initialData.isActive }
    : { name: "", category: "boarding", description: "", price: 0, currency: "EUR", unit: "per_month", unitLabel: "", photoUrl: "", isActive: true }
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: defaults })

  const unitValue = watch("unit")
  const onFormSubmit = (data: FormData) => onSubmit({ ...data, price: Math.round(data.price * 100), description: data.description || "", photoUrl: data.photoUrl || "", unitLabel: data.unitLabel || "" })

  const inputClass = "w-full px-3 py-2 rounded-md text-sm bg-[#252538] border border-[#3A3A52] text-[var(--text-primary)] focus:outline-none focus:border-[#2C5F2E]"
  const labelClass = "block text-sm font-medium text-[var(--text-muted)] mb-1"
  const errorClass = "text-xs text-red-400 mt-1"

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1A1A2E] h-full overflow-y-auto animate-in slide-in-from-right">
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-[#252538] bg-[#1A1A2E]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{isEditing ? "Edit Service" : "Add Service"}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#252538]"><X className="h-5 w-5 text-[var(--text-muted)]" /></button>
        </div>
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
          <div><label className={labelClass}>Name *</label><input {...register("name")} className={inputClass} />{errors.name && <p className={errorClass}>{errors.name.message}</p>}</div>
          <div><label className={labelClass}>Category *</label><select {...register("category")} className={inputClass}>{categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          <div><label className={labelClass}>Description</label><textarea {...register("description")} rows={3} className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Price *</label><input type="number" step="0.01" {...register("price", { valueAsNumber: true })} className={inputClass} />{errors.price && <p className={errorClass}>{errors.price.message}</p>}</div>
            <div><label className={labelClass}>Currency *</label><select {...register("currency")} className={inputClass}>{currencies.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Unit *</label><select {...register("unit")} className={inputClass}>{units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}</select></div>
            {unitValue === "custom" && <div><label className={labelClass}>Custom Unit</label><input {...register("unitLabel")} className={inputClass} placeholder="e.g. /bag" /></div>}
          </div>
          <div><label className={labelClass}>Photo URL</label><input {...register("photoUrl")} className={inputClass} placeholder="https://..." /></div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" {...register("isActive")} className="w-4 h-4 rounded border-[#3A3A52] bg-[#252538] text-[#2C5F2E] focus:ring-[#2C5F2E]" />
            <label htmlFor="isActive" className="text-sm text-[var(--text-primary)]">Active</label>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-md text-sm font-medium bg-[#252538] text-[var(--text-primary)] hover:bg-[#3A3A52]">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#2C5F2E" }}>{isEditing ? "Save Changes" : "Add Service"}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
