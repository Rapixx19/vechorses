/**
 * FILE: modules/dashboard/components/RecentBilling.tsx
 * ZONE: Green
 * PURPOSE: Display recent billing line items table
 * EXPORTS: RecentBilling
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: app/dashboard/page.tsx
 * TESTS: modules/dashboard/tests/RecentBilling.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

import type { BillingLineItem, Client } from "@/lib/types"

interface RecentBillingProps {
  billingItems: BillingLineItem[]
  clients: Client[]
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-600/20 text-amber-400",
  invoiced: "bg-blue-600/20 text-blue-400",
  paid: "bg-green-600/20 text-green-400",
  cancelled: "bg-gray-600/20 text-gray-400",
}

export function RecentBilling({ billingItems, clients }: RecentBillingProps) {
  const recentItems = billingItems
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const getClientName = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.fullName ?? "Unknown"

  const formatAmount = (cents: number) =>
    `€${(cents / 100).toFixed(2)}`

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
      <h3 className="font-semibold text-[var(--text-primary)] mb-3">Recent Billing</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">Client</th>
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 font-medium text-right">Amount</th>
              <th className="pb-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentItems.map((item) => (
              <tr key={item.id} className="border-b border-[var(--border)]/50">
                <td className="py-2 text-[var(--text-muted)]">{formatDate(item.serviceDate)}</td>
                <td className="py-2 text-[var(--text-primary)]">{getClientName(item.clientId)}</td>
                <td className="py-2 text-[var(--text-muted)] truncate max-w-[200px]">{item.description}</td>
                <td className="py-2 text-[var(--text-primary)] text-right">{formatAmount(item.amountCents)}</td>
                <td className="py-2 text-right">
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[item.status]}`}>
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
