/**
 * FILE: modules/billing/components/BillingFilters.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Filter controls for billing table — search, status, service type, date range
 * EXPORTS: BillingFilters, BillingFilterState
 * DEPENDS ON: lucide-react
 * CONSUMED BY: app/billing/page.tsx
 * TESTS: modules/billing/tests/BillingFilters.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

// 🔴 RED ZONE — billing module, handle with care

import { Search } from "lucide-react"
import type { BillingStatus, ServiceType } from "@/lib/types"

export interface BillingFilterState {
  search: string
  status: BillingStatus | "all"
  serviceType: ServiceType | "all"
  dateRange: "this_month" | "last_month" | "last_3_months" | "all"
}

interface BillingFiltersProps {
  filters: BillingFilterState
  onChange: (filters: BillingFilterState) => void
}

const selectClass = "px-3 py-2 rounded-md bg-[#1A1A2E] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"

export function BillingFilters({ filters, onChange }: BillingFiltersProps) {
  const update = (key: keyof BillingFilterState, value: string) => onChange({ ...filters, [key]: value })

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search client or description..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md bg-[#1A1A2E] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
        />
      </div>
      <select value={filters.status} onChange={(e) => update("status", e.target.value)} className={selectClass}>
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="invoiced">Invoiced</option>
        <option value="paid">Paid</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select value={filters.serviceType} onChange={(e) => update("serviceType", e.target.value)} className={selectClass}>
        <option value="all">All Services</option>
        <option value="boarding">Boarding</option>
        <option value="lesson">Lesson</option>
        <option value="farrier">Farrier</option>
        <option value="vet">Vet</option>
        <option value="other">Other</option>
      </select>
      <select value={filters.dateRange} onChange={(e) => update("dateRange", e.target.value)} className={selectClass}>
        <option value="all">All Time</option>
        <option value="this_month">This Month</option>
        <option value="last_month">Last Month</option>
        <option value="last_3_months">Last 3 Months</option>
      </select>
    </div>
  )
}
