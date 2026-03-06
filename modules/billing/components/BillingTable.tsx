/**
 * FILE: modules/billing/components/BillingTable.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Table displaying billing line items with status badges
 * EXPORTS: BillingTable
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: app/billing/page.tsx
 * TESTS: modules/billing/tests/BillingTable.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

// 🔴 RED ZONE — billing module, handle with care

import type { BillingLineItem, BillingStatus, ServiceType, Client } from "@/lib/types"

interface BillingTableProps {
  items: BillingLineItem[]
  clients: Client[]
  onItemClick: (item: BillingLineItem) => void
}

const statusColors: Record<BillingStatus, string> = {
  pending: "border-amber-600/40 text-amber-400 bg-amber-900/20",
  invoiced: "border-blue-600/40 text-blue-400 bg-blue-900/20",
  paid: "border-green-600/40 text-green-400 bg-green-900/20",
  cancelled: "border-gray-500/40 text-gray-400 bg-gray-900/20",
}

const serviceColors: Record<ServiceType, string> = {
  boarding: "border-purple-600/40 text-purple-400",
  lesson: "border-blue-600/40 text-blue-400",
  farrier: "border-amber-600/40 text-amber-400",
  vet: "border-red-600/40 text-red-400",
  other: "border-gray-500/40 text-gray-400",
}

export function BillingTable({ items, clients, onItemClick }: BillingTableProps) {
  const getClientName = (clientId: string) => clients.find((c) => c.id === clientId)?.fullName || "Unknown"
  const formatAmount = (cents: number) => `€${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}`
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

  if (items.length === 0) {
    return <p className="text-center py-8 text-sm text-[var(--text-muted)]">No billing items found</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-3 px-2 text-xs font-medium text-[var(--text-muted)]">Date</th>
            <th className="text-left py-3 px-2 text-xs font-medium text-[var(--text-muted)]">Client</th>
            <th className="text-left py-3 px-2 text-xs font-medium text-[var(--text-muted)]">Service</th>
            <th className="text-left py-3 px-2 text-xs font-medium text-[var(--text-muted)]">Description</th>
            <th className="text-right py-3 px-2 text-xs font-medium text-[var(--text-muted)]">Amount</th>
            <th className="text-center py-3 px-2 text-xs font-medium text-[var(--text-muted)]">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} onClick={() => onItemClick(item)} className="border-b border-[var(--border)] hover:bg-[#1A1A2E] cursor-pointer">
              <td className="py-3 px-2 text-[var(--text-muted)]">{formatDate(item.serviceDate)}</td>
              <td className="py-3 px-2 text-[var(--text-primary)]">{getClientName(item.clientId)}</td>
              <td className="py-3 px-2">
                <span className={`px-2 py-0.5 rounded border text-[10px] capitalize ${serviceColors[item.serviceType]}`}>
                  {item.serviceType}
                </span>
              </td>
              <td className="py-3 px-2 text-[var(--text-primary)] max-w-[200px] truncate">{item.description}</td>
              <td className="py-3 px-2 text-right text-[var(--text-primary)] font-medium">{formatAmount(item.amountCents)}</td>
              <td className="py-3 px-2 text-center">
                <span className={`px-2 py-0.5 rounded border text-[10px] capitalize ${statusColors[item.status]}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
