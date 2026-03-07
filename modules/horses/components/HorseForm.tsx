/**
 * FILE: modules/horses/components/HorseForm.tsx
 * ZONE: Green
 * PURPOSE: Add/Edit form for horses with validation
 * EXPORTS: HorseForm
 * DEPENDS ON: react-hook-form, zod, useClients, useStalls
 * CONSUMED BY: app/horses/new/page.tsx, app/horses/[id]/edit/page.tsx
 * TESTS: modules/horses/tests/HorseForm.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useClients } from "@/modules/clients"
import { useStalls } from "@/modules/stalls"
import type { Horse } from "@/lib/types"

const horseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  breed: z.string().min(1, "Breed is required"),
  color: z.string().min(1, "Color is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  stallId: z.string().nullable(),
  ownerId: z.string().min(1, "Owner is required"),
  feedingNotes: z.string(),
  medicalNotes: z.string(),
})

type HorseFormData = z.infer<typeof horseSchema>

interface HorseFormProps {
  initialData?: Horse | null
  onSubmit: (data: HorseFormData) => void
  isEditing?: boolean
}

const BREEDS = ["Thoroughbred", "Arabian", "Warmblood", "Friesian", "Andalusian", "Hanoverian", "Irish Sport Horse", "Lusitano"]
const COLORS = ["Bay", "Chestnut", "Black", "Grey", "Palomino", "Buckskin", "Dun", "Cremello"]

export function HorseForm({ initialData, onSubmit, isEditing = false }: HorseFormProps) {
  const { clients, isLoading: clientsLoading } = useClients()
  const { stalls, isLoading: stallsLoading } = useStalls()

  // BREADCRUMB: All hooks must be called before any conditional returns (React rules of hooks)
  const { register, handleSubmit, formState: { errors } } = useForm<HorseFormData>({
    resolver: zodResolver(horseSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      breed: initialData?.breed ?? "",
      color: initialData?.color ?? "",
      dateOfBirth: initialData?.dateOfBirth ?? "",
      stallId: initialData?.stallId ?? null,
      ownerId: initialData?.ownerId ?? "",
      feedingNotes: initialData?.feedingNotes ?? "",
      medicalNotes: initialData?.medicalNotes ?? "",
    },
  })

  const isLoading = clientsLoading || stallsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C5F2E]" />
      </div>
    )
  }

  // BREADCRUMB: Show only empty stalls + current horse's stall
  const availableStalls = stalls.filter((s) => !s.horseId || s.id === initialData?.stallId)

  const inputClass = "w-full px-3 py-2 rounded-md bg-[#1A1A2E] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
  const labelClass = "block text-sm font-medium text-[var(--text-primary)] mb-1"
  const errorClass = "text-xs text-red-400 mt-1"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input {...register("name")} className={inputClass} placeholder="Horse name" />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Breed *</label>
          <select {...register("breed")} className={inputClass}>
            <option value="">Select breed</option>
            {BREEDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          {errors.breed && <p className={errorClass}>{errors.breed.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Color *</label>
          <select {...register("color")} className={inputClass}>
            <option value="">Select color</option>
            {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.color && <p className={errorClass}>{errors.color.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Date of Birth *</label>
          <input type="date" {...register("dateOfBirth")} className={inputClass} />
          {errors.dateOfBirth && <p className={errorClass}>{errors.dateOfBirth.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Owner *</label>
          <select {...register("ownerId")} className={inputClass}>
            <option value="">Select owner</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
          </select>
          {errors.ownerId && <p className={errorClass}>{errors.ownerId.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Stall</label>
          <select {...register("stallId")} className={inputClass}>
            <option value="">No stall assigned</option>
            {availableStalls.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Feeding Notes</label>
        <textarea {...register("feedingNotes")} rows={3} className={inputClass} placeholder="Feeding instructions..." />
      </div>
      <div>
        <label className={labelClass}>Medical Notes</label>
        <textarea {...register("medicalNotes")} rows={3} className={inputClass} placeholder="Medical history..." />
      </div>
      <button type="submit" className="px-6 py-2 rounded-md text-white font-medium" style={{ backgroundColor: "#2C5F2E" }}>
        {isEditing ? "Save Changes" : "Add Horse"}
      </button>
    </form>
  )
}
