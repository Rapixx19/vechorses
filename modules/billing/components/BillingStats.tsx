/**
 * FILE: modules/billing/components/BillingStats.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Summary stats for billing — revenue, outstanding, monthly, overdue, clients
 * EXPORTS: BillingStats
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: app/billing/page.tsx
 * TESTS: modules/billing/tests/BillingStats.test.tsx
 * LAST CHANGED: 2026-03-06 — Added clients with outstanding stat
 */

// 🔴 RED ZONE — billing module, handle with care

import type { BillingLineItem } from "@/lib/types"

interface BillingStatsProps {
  items: BillingLineItem[]
}

export function BillingStats({ items }: BillingStatsProps) {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const totalRevenue = items.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amountCents, 0)
  const outstanding = items.filter((i) => i.status === "pending").reduce((sum, i) => sum + i.amountCents, 0)
  const thisMonthTotal = items
    .filter((i) => { const d = new Date(i.serviceDate); return d.getMonth() === thisMonth && d.getFullYear() === thisYear })
    .reduce((sum, i) => sum + i.amountCents, 0)
  const overdueCount = items.filter((i) => i.status === "pending" && new Date(i.serviceDate) < thirtyDaysAgo).length
  const clientsWithOutstanding = new Set(items.filter((i) => i.status === "pending").map((i) => i.clientId)).size

  const formatAmount = (cents: number) => `€${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}`

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard label="Total Revenue" value={formatAmount(totalRevenue)} color="green" />
      <StatCard label="Outstanding" value={formatAmount(outstanding)} color="amber" />
      <StatCard label="This Month" value={formatAmount(thisMonthTotal)} color="default" />
      <StatCard label="Overdue" value={String(overdueCount)} color={overdueCount > 0 ? "red" : "default"} />
      <StatCard label="Clients Outstanding" value={String(clientsWithOutstanding)} color={clientsWithOutstanding > 0 ? "amber" : "default"} />
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: "green" | "amber" | "red" | "default" }) {
  const textColor = color === "green" ? "text-green-400" : color === "amber" ? "text-amber-400" : color === "red" ? "text-red-400" : "text-[var(--text-primary)]"
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className={`text-xl font-semibold ${textColor}`}>{value}</p>
    </div>
  )
}
