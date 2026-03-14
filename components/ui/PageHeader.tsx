/**
 * FILE: components/ui/PageHeader.tsx
 * ZONE: Green
 * PURPOSE: Consistent page header component used across all pages
 * EXPORTS: PageHeader, PageHeaderProps
 * DEPENDS ON: react
 * CONSUMED BY: All page components
 * TESTS: components/ui/tests/PageHeader.test.tsx
 * LAST CHANGED: 2026-03-14 — Initial creation for UI consistency audit
 */

"use client"

export interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, actions, className = "" }: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}
