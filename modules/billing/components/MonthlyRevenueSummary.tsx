/**
 * FILE: modules/billing/components/MonthlyRevenueSummary.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Visual bar chart showing last 6 months revenue
 * EXPORTS: MonthlyRevenueSummary
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: app/billing/page.tsx
 * TESTS: modules/billing/tests/MonthlyRevenueSummary.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

// 🔴 RED ZONE — billing module, handle with care

import type { BillingLineItem } from "@/lib/types"

interface MonthlyRevenueSummaryProps {
  items: BillingLineItem[]
}

export function MonthlyRevenueSummary({ items }: MonthlyRevenueSummaryProps) {
  const now = new Date()
  const months: { label: string; year: number; month: number }[] = []

  // BREADCRUMB: Generate last 6 months labels
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      label: d.toLocaleDateString("en-GB", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    })
  }

  // Calculate revenue per month (paid items only)
  const monthlyData = months.map((m) => {
    const revenue = items
      .filter((item) => {
        if (item.status !== "paid") return false
        const d = new Date(item.serviceDate)
        return d.getFullYear() === m.year && d.getMonth() === m.month
      })
      .reduce((sum, item) => sum + item.amountCents, 0)
    return { ...m, revenue }
  })

  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1)
  const formatAmount = (cents: number) => `€${(cents / 100).toLocaleString("de-DE", { maximumFractionDigits: 0 })}`

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-4">Monthly Revenue</h3>
      <div className="flex items-end gap-2 h-32">
        {monthlyData.map((m, i) => {
          const height = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <span className="text-[10px] text-[var(--text-muted)] mb-1">
                {m.revenue > 0 ? formatAmount(m.revenue) : "—"}
              </span>
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: `${Math.max(height, 4)}%`,
                  backgroundColor: m.revenue > 0 ? "#2C5F2E" : "#252538",
                }}
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-2">{m.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
