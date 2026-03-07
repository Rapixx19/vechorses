/**
 * FILE: modules/services/components/ServiceCard.tsx
 * ZONE: Green
 * PURPOSE: Display a single service with edit/delete actions
 * EXPORTS: ServiceCard
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: ServiceGrid
 * TESTS: modules/services/tests/ServiceCard.test.tsx
 * LAST CHANGED: 2026-03-07 — Fixed currency display to use service.currency
 */

import { Edit2, Trash2, Home, GraduationCap, Hammer, Stethoscope, Sparkles, Dumbbell, Trophy, Wheat, MoreHorizontal } from "lucide-react"
import type { Service, ServiceCategory } from "@/lib/types"

interface ServiceCardProps {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
}

const categoryIcons: Record<ServiceCategory, React.ElementType> = {
  boarding: Home,
  lessons: GraduationCap,
  farrier: Hammer,
  vet: Stethoscope,
  grooming: Sparkles,
  training: Dumbbell,
  competitions: Trophy,
  feed: Wheat,
  other: MoreHorizontal,
}

const categoryColors: Record<ServiceCategory, string> = {
  boarding: "bg-purple-500/20 text-purple-400",
  lessons: "bg-blue-500/20 text-blue-400",
  farrier: "bg-amber-500/20 text-amber-400",
  vet: "bg-red-500/20 text-red-400",
  grooming: "bg-pink-500/20 text-pink-400",
  training: "bg-green-500/20 text-green-400",
  competitions: "bg-yellow-500/20 text-yellow-400",
  feed: "bg-orange-500/20 text-orange-400",
  other: "bg-gray-500/20 text-gray-400",
}

const unitLabels: Record<string, string> = {
  per_month: "/month",
  per_session: "/session",
  per_day: "/day",
  per_visit: "/visit",
  per_item: "/item",
  custom: "",
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const Icon = categoryIcons[service.category]

  // BREADCRUMB: Format price with correct currency symbol
  const formatPrice = (cents: number, currency: string) => {
    const value = (cents / 100).toLocaleString("de-CH", { minimumFractionDigits: 2 })
    if (currency === "CHF") return `CHF ${value}`
    if (currency === "USD") return `$${value}`
    if (currency === "GBP") return `£${value}`
    return `€${value}`
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
      {/* Photo / Placeholder */}
      <div className="h-32 bg-[#252538] flex items-center justify-center relative">
        {service.photoUrl ? (
          <img src={service.photoUrl} alt={service.name} className="w-full h-full object-cover" />
        ) : (
          <Icon className="h-12 w-12 text-[var(--text-muted)]" />
        )}
        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button onClick={() => onEdit(service)} className="p-1.5 rounded bg-black/50 text-white hover:bg-black/70">
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(service)} className="p-1.5 rounded bg-black/50 text-red-400 hover:bg-black/70">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-[var(--text-primary)] truncate">{service.name}</h3>
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize whitespace-nowrap ${categoryColors[service.category]}`}>
            {service.category}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">{service.description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold text-[var(--text-primary)]">{formatPrice(service.price, service.currency)}</span>
          <span className="text-xs text-[var(--text-muted)]">{service.unitLabel || unitLabels[service.unit]}</span>
        </div>
      </div>
    </div>
  )
}
