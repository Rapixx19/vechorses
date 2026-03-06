/**
 * FILE: modules/dashboard/components/StatCard.tsx
 * ZONE: Green
 * PURPOSE: Minimal stat card for dashboard metrics
 * EXPORTS: StatCard
 * DEPENDS ON: lucide-react
 * CONSUMED BY: app/dashboard/page.tsx
 * TESTS: modules/dashboard/tests/StatCard.test.tsx
 * LAST CHANGED: 2026-03-06 — Polished to be cleaner and less heavy
 */

import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  children?: React.ReactNode
}

export function StatCard({ title, value, subtitle, icon: Icon, children }: StatCardProps) {
  return (
    <div className="rounded-md px-4 py-3 border border-[var(--border)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--text-muted)]">{title}</span>
        <Icon className="h-4 w-4 text-[var(--text-muted)] opacity-60" />
      </div>
      <div className="text-xl font-semibold" style={{ color: "#2C5F2E" }}>
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
      )}
      {children}
    </div>
  )
}
