/**
 * FILE: modules/clients/components/ClientBillingHistory.tsx
 * ZONE: Green
 * PURPOSE: Full billing history with summary stats for a client
 * EXPORTS: ClientBillingHistory
 * DEPENDS ON: useBilling, lib/types.ts
 * CONSUMED BY: ClientDetail
 * TESTS: modules/clients/tests/ClientBillingHistory.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

"use client"

import { useBilling } from "@/modules/billing"
import type { BillingStatus, ServiceType } from "@/lib/types"

interface ClientBillingHistoryProps {
  clientId: string
}

const statusColors: Record<BillingStatus, string> = {
  pending: "border-amber-600/40 text-amber-500",
  invoiced: "border-blue-600/40 text-blue-400",
  paid: "border-green-600/40 text-green-400",
  cancelled: "border-gray-500/40 text-gray-400",
}

const serviceTypeLabels: Record<ServiceType, string> = {
  boarding: "Boarding",
  lesson: "Lesson",
  farrier: "Farrier",
  vet: "Vet",
  other: "Other",
}

const rowColors: Record<BillingStatus, string> = {
  paid: "bg-green-900/10",
  pending: "bg-amber-900/10",
  invoiced: "",
  cancelled: "opacity-50",
}

export function ClientBillingHistory({ clientId }: ClientBillingHistoryProps) {
  const allBilling = useBilling()
  const clientBilling = allBilling
    .filter((b) => b.clientId === clientId)
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())

  const paidItems = clientBilling.filter((b) => b.status === "paid")
  const pendingItems = clientBilling.filter((b) => b.status === "pending")

  const totalRevenue = paidItems.reduce((sum, b) => sum + b.amountCents, 0)
  const outstanding = pendingItems.reduce((sum, b) => sum + b.amountCents, 0)
  const totalInvoices = clientBilling.length
  const lastPayment = paidItems.length > 0
    ? new Date(paidItems.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())[0].serviceDate)
    : null
  const totalValue = clientBilling
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.amountCents, 0)

  const formatAmount = (cents: number) => `€${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}`
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatAmount(totalRevenue)} />
        <StatCard label="Outstanding" value={formatAmount(outstanding)} highlight={outstanding > 0} />
        <StatCard label="Total Invoices" value={String(totalInvoices)} />
        <StatCard label="Last Payment" value={lastPayment ? formatDate(lastPayment.toISOString()) : "—"} />
      </div>

      {/* Billing History Table */}
      {clientBilling.length === 0 ? (
        <p className="text-center py-8 text-sm text-[var(--text-muted)]">No billing records</p>
      ) : (
        <div className="space-y-2">
          {clientBilling.map((item) => (
            <div key={item.id} className={`flex items-center gap-4 p-3 rounded-md ${rowColors[item.status]}`} style={{ backgroundColor: rowColors[item.status] ? undefined : "#1A1A2E" }}>
              <span className="text-xs text-[var(--text-muted)] w-20">{formatDate(item.serviceDate)}</span>
              <span className="flex-1 text-sm text-[var(--text-primary)]">{item.description}</span>
              <span className="px-2 py-0.5 rounded border border-[var(--border)] text-[10px] text-[var(--text-muted)]">
                {serviceTypeLabels[item.serviceType]}
              </span>
              <span className="text-sm text-[var(--text-primary)] w-24 text-right">{formatAmount(item.amountCents)}</span>
              <span className={`px-2 py-0.5 rounded border text-[10px] w-20 text-center ${statusColors[item.status]}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      {clientBilling.length > 0 && (
        <div className="flex justify-end pt-4 border-t border-[var(--border)]">
          <span className="text-sm text-[var(--text-muted)]">Total value: </span>
          <span className="text-sm font-medium text-[var(--text-primary)] ml-2">{formatAmount(totalValue)}</span>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className={`text-lg font-semibold ${highlight ? "text-amber-400" : "text-[var(--text-primary)]"}`}>{value}</p>
    </div>
  )
}
