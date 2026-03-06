/**
 * FILE: modules/horses/components/HorseCard.tsx
 * ZONE: Green
 * PURPOSE: Clickable card displaying horse summary info
 * EXPORTS: HorseCard
 * DEPENDS ON: lib/types.ts, next/link
 * CONSUMED BY: HorseList
 * TESTS: modules/horses/tests/HorseCard.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

import Link from "next/link"
import type { Horse } from "@/lib/types"

interface HorseCardProps {
  horse: Horse
  ownerName: string
  stallLabel: string
}

// BREADCRUMB: Breed colors for visual distinction
const breedColors: Record<string, string> = {
  Thoroughbred: "#DC2626",
  Arabian: "#D97706",
  Warmblood: "#2563EB",
  Friesian: "#1F2937",
  Andalusian: "#7C3AED",
  Hanoverian: "#059669",
  "Irish Sport Horse": "#0891B2",
  Lusitano: "#DB2777",
}

export function HorseCard({ horse, ownerName, stallLabel }: HorseCardProps) {
  const borderColor = breedColors[horse.breed] ?? "#6B7280"

  return (
    <Link href={`/horses/${horse.id}`}>
      <div
        className="rounded-lg p-4 hover:bg-[#252538] transition-colors cursor-pointer"
        style={{ backgroundColor: "#1A1A2E", borderLeft: `4px solid ${borderColor}` }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[var(--text-primary)]">{horse.name}</h3>
          <span className="text-xs text-[var(--text-muted)]">{stallLabel}</span>
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {horse.breed} · {horse.color}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2">Owner: {ownerName}</p>
      </div>
    </Link>
  )
}
