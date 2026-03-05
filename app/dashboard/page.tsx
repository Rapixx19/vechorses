/**
 * FILE: app/dashboard/page.tsx
 * ZONE: Green
 * PURPOSE: Dashboard page showing daily overview
 * EXPORTS: default (DashboardPage)
 * DEPENDS ON: modules/dashboard
 * CONSUMED BY: Next.js routing
 * TESTS: app/dashboard/page.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <p className="text-muted-foreground">
        Daily overview of horses, tasks, stalls, and billing.
      </p>
    </div>
  )
}
