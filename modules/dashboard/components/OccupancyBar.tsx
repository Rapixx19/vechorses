/**
 * FILE: modules/dashboard/components/OccupancyBar.tsx
 * ZONE: Green
 * PURPOSE: Thin inline occupancy progress bar
 * EXPORTS: OccupancyBar
 * DEPENDS ON: None
 * CONSUMED BY: app/dashboard/page.tsx (inside StatCard)
 * TESTS: modules/dashboard/tests/OccupancyBar.test.tsx
 * LAST CHANGED: 2026-03-06 — Made thinner and inline-friendly
 */

interface OccupancyBarProps {
  occupied: number
  total: number
}

export function OccupancyBar({ occupied, total }: OccupancyBarProps) {
  const percentage = Math.round((occupied / total) * 100)

  return (
    <div className="mt-2">
      <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: "#2C5F2E",
          }}
        />
      </div>
    </div>
  )
}
