/**
 * FILE: modules/dashboard/components/StatCard.tsx
 * ZONE: Green
 * PURPOSE: Reusable stat card for dashboard metrics
 * EXPORTS: StatCard
 * DEPENDS ON: lucide-react
 * CONSUMED BY: app/dashboard/page.tsx
 * TESTS: modules/dashboard/tests/StatCard.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
}

export function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="rounded-lg p-5" style={{ backgroundColor: "#1A1A2E" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[var(--text-muted)]">{title}</span>
        <Icon className="h-5 w-5 text-[var(--text-muted)]" />
      </div>
      <div className="text-3xl font-bold" style={{ color: "#2C5F2E" }}>
        {value}
      </div>
      {subtitle && (
        <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>
      )}
      {trend && (
        <p className={`text-sm mt-1 ${trend.value >= 0 ? "text-green-500" : "text-red-500"}`}>
          {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  )
}
