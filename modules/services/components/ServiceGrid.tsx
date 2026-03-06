/**
 * FILE: modules/services/components/ServiceGrid.tsx
 * ZONE: Green
 * PURPOSE: Grid display of services with category filtering
 * EXPORTS: ServiceGrid
 * DEPENDS ON: ServiceCard, useServices, lib/types.ts, lucide-react
 * CONSUMED BY: app/services/page.tsx
 * TESTS: modules/services/tests/ServiceGrid.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for service management
 */

"use client"

import { useState } from "react"
import { Plus, FileUp } from "lucide-react"
import { ServiceCard } from "./ServiceCard"
import { ServiceForm } from "./ServiceForm"
import { PdfImporter } from "./PdfImporter"
import { useServices, useAddService, useUpdateService, useDeleteService } from "../hooks/useServices"
import type { Service, ServiceCategory } from "@/lib/types"

const categories: { id: ServiceCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "boarding", label: "Boarding" },
  { id: "lessons", label: "Lessons" },
  { id: "farrier", label: "Farrier" },
  { id: "vet", label: "Vet" },
  { id: "grooming", label: "Grooming" },
  { id: "training", label: "Training" },
  { id: "competitions", label: "Competitions" },
  { id: "feed", label: "Feed" },
  { id: "other", label: "Other" },
]

export function ServiceGrid() {
  const services = useServices()
  const addService = useAddService()
  const updateService = useUpdateService()
  const deleteService = useDeleteService()
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all")
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showImporter, setShowImporter] = useState(false)

  const filteredServices = activeCategory === "all" ? services : services.filter((s) => s.category === activeCategory)
  const getCategoryCount = (cat: ServiceCategory | "all") => (cat === "all" ? services.length : services.filter((s) => s.category === cat).length)

  const handleEdit = (service: Service) => { setEditingService(service); setShowForm(true) }
  const handleDelete = (service: Service) => { if (confirm(`Delete "${service.name}"?`)) deleteService(service.id) }
  const handleSubmit = (data: Omit<Service, "id" | "createdAt">) => {
    if (editingService) { updateService(editingService.id, data) } else { addService(data) }
    setShowForm(false); setEditingService(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-muted)]">{filteredServices.length} services</span>
        <div className="flex gap-2">
          <button onClick={() => setShowImporter(true)} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-amber-900/30 text-amber-400 hover:bg-amber-900/50">
            <FileUp className="h-4 w-4" />Import from PDF
          </button>
          <button onClick={() => { setEditingService(null); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#2C5F2E" }}>
            <Plus className="h-4 w-4" />Add Service
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 p-1 rounded-lg overflow-x-auto" style={{ backgroundColor: "#1A1A2E" }}>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat.id ? "bg-[#2C5F2E] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
            {cat.label}
            <span className={`text-xs px-1.5 py-0.5 rounded ${activeCategory === cat.id ? "bg-white/20" : "bg-[#252538]"}`}>{getCategoryCount(cat.id)}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <ServiceCard key={service.id} service={service} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
        {filteredServices.length === 0 && <p className="col-span-full text-center py-12 text-[var(--text-muted)]">No services in this category</p>}
      </div>

      {showForm && <ServiceForm initialData={editingService} isEditing={!!editingService} onSubmit={handleSubmit} onClose={() => { setShowForm(false); setEditingService(null) }} />}
      {showImporter && <PdfImporter onClose={() => setShowImporter(false)} onImport={(imported) => { imported.forEach((s) => addService(s)); setShowImporter(false) }} />}
    </div>
  )
}
