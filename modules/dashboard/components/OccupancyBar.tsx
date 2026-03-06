/**
 * FILE: modules/dashboard/components/OccupancyBar.tsx
 * ZONE: Green
 * PURPOSE: Visual stall occupancy progress bar
 * EXPORTS: OccupancyBar
 * DEPENDS ON: None
 * CONSUMED BY: app/dashboard/page.tsx
 * TESTS: modules/dashboard/tests/OccupancyBar.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

interface OccupancyBarProps {
  occupied: number
  total: number
}

export function OccupancyBar({ occupied, total }: OccupancyBarProps) {
  const percentage = Math.round((occupied / total) * 100)

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          Stall Occupancy
        </span>
        <span className="text-sm text-[var(--text-muted)]">
          {occupied}/{total} stalls occupied
        </span>
      </div>
      <div className="h-3 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: "#2C5F2E",
          }}
        />
      </div>
    </div>
  )
}
