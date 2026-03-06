/**
 * FILE: modules/dashboard/components/RecentBilling.tsx
 * ZONE: Green
 * PURPOSE: Display recent billing with clean table styling
 * EXPORTS: RecentBilling
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: app/dashboard/page.tsx
 * TESTS: modules/dashboard/tests/RecentBilling.test.tsx
 * LAST CHANGED: 2026-03-06 — Cleaned up table, smaller badges, hover state
 */

import type { BillingLineItem, Client } from "@/lib/types"

interface RecentBillingProps {
  billingItems: BillingLineItem[]
  clients: Client[]
}

// BREADCRUMB: Smaller, more subtle status badges
const statusColors: Record<string, string> = {
  pending: "border-amber-600/40 text-amber-500/70",
  invoiced: "border-blue-600/40 text-blue-400/70",
  paid: "border-green-600/40 text-green-400/70",
  cancelled: "border-gray-500/40 text-gray-400/70",
}

export function RecentBilling({ billingItems, clients }: RecentBillingProps) {
  const recentItems = billingItems
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const getClientName = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.fullName ?? "Unknown"

  const formatAmount = (cents: number) => `${(cents / 100).toFixed(2)}`

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })

  return (
    <div className="rounded-md px-4 py-3 border border-[var(--border)]">
      <h3 className="text-xs font-medium text-[var(--text-muted)] mb-3">Recent Billing</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[var(--text-muted)]">
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">Client</th>
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 font-medium text-right">Amount</th>
              <th className="pb-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentItems.map((item) => (
              <tr key={item.id} className="hover:bg-[var(--border)]/20 transition-colors">
                <td className="py-1.5 text-[var(--text-muted)]">{formatDate(item.serviceDate)}</td>
                <td className="py-1.5 text-[var(--text-primary)]">{getClientName(item.clientId)}</td>
                <td className="py-1.5 text-[var(--text-muted)] truncate max-w-[180px]">
                  {item.description}
                </td>
                <td className="py-1.5 text-[var(--text-primary)] text-right">{formatAmount(item.amountCents)}</td>
                <td className="py-1.5 text-right">
                  <span className={`px-1.5 py-0.5 rounded border text-[10px] ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
