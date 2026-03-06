/**
 * FILE: modules/billing/components/NewBillingItemForm.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Sheet form for creating new billing line items with service catalogue
 * EXPORTS: NewBillingItemForm
 * DEPENDS ON: react-hook-form, zod, lib/types.ts, lucide-react, useServices
 * CONSUMED BY: app/billing/page.tsx
 * TESTS: modules/billing/tests/NewBillingItemForm.test.tsx
 * LAST CHANGED: 2026-03-06 — Added service catalogue dropdown
 */

// 🔴 RED ZONE — billing module, handle with care

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"
import { useServices } from "@/modules/services/hooks/useServices"
import type { Client, BillingLineItem, ServiceType } from "@/lib/types"

const schema = z.object({
  clientId: z.string().min(1, "Client is required"),
  serviceType: z.enum(["boarding", "lesson", "farrier", "vet", "other"]),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  serviceDate: z.string().min(1, "Service date is required"),
  notes: z.string(),
})

type FormData = z.infer<typeof schema>

interface NewBillingItemFormProps {
  clients: Client[]
  preselectedClientId?: string | null
  onSubmit: (item: Omit<BillingLineItem, "id" | "createdAt">) => void
  onClose: () => void
}

const serviceTypeMap: Record<string, ServiceType> = { boarding: "boarding", lessons: "lesson", farrier: "farrier", vet: "vet", grooming: "other", training: "other", competitions: "other", feed: "other", other: "other" }

export function NewBillingItemForm({ clients, preselectedClientId, onSubmit, onClose }: NewBillingItemFormProps) {
  const services = useServices()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { clientId: preselectedClientId || "", serviceType: "boarding", notes: "", serviceDate: new Date().toISOString().split("T")[0] },
  })

  const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const svc = services.find((s) => s.id === e.target.value)
    if (svc) { setValue("description", svc.name); setValue("amount", svc.price / 100); setValue("serviceType", serviceTypeMap[svc.category] || "other") }
  }

  const inputClass = "w-full px-3 py-2 rounded-md bg-[#1A1A2E] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
  const labelClass = "block text-xs font-medium text-[var(--text-muted)] mb-1"
  const errorClass = "text-xs text-red-400 mt-1"

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      clientId: data.clientId,
      serviceType: data.serviceType as ServiceType,
      description: data.description,
      amountCents: Math.round(data.amount * 100),
      currency: "EUR",
      status: "pending",
      serviceDate: data.serviceDate,
    })
    alert("Billing item created")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-80 h-full bg-[#0F1117] border-l border-[var(--border)] p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-6">New Billing Item</h3>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Client *</label>
            <select {...register("clientId")} className={inputClass}>
              <option value="">Select client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
            {errors.clientId && <p className={errorClass}>{errors.clientId.message}</p>}
          </div>
          <div>
            <label className={labelClass}>From Catalogue</label>
            <select onChange={handleServiceSelect} className={inputClass} defaultValue="">
              <option value="">— Manual Entry —</option>
              {services.filter((s) => s.isActive).map((s) => <option key={s.id} value={s.id}>{s.name} (€{(s.price / 100).toFixed(2)})</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Service Type *</label>
            <select {...register("serviceType")} className={inputClass}>
              <option value="boarding">Boarding</option>
              <option value="lesson">Lesson</option>
              <option value="farrier">Farrier</option>
              <option value="vet">Vet</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Description *</label>
            <input {...register("description")} className={inputClass} placeholder="Monthly boarding fee..." />
            {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Amount (EUR) *</label>
            <input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} className={inputClass} placeholder="450.00" />
            {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Service Date *</label>
            <input type="date" {...register("serviceDate")} className={inputClass} />
            {errors.serviceDate && <p className={errorClass}>{errors.serviceDate.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea {...register("notes")} rows={2} className={inputClass} placeholder="Optional notes..." />
          </div>
          <button type="submit" className="w-full px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#2C5F2E" }}>
            Create Item
          </button>
        </form>
      </div>
    </div>
  )
}
