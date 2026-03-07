/**
 * FILE: modules/horses/components/HorseCard.tsx
 * ZONE: Green
 * PURPOSE: Clickable card with avatar displaying horse summary
 * EXPORTS: HorseCard
 * DEPENDS ON: lib/types.ts, next/link, lucide-react
 * CONSUMED BY: HorseList
 * TESTS: modules/horses/tests/HorseCard.test.tsx
 * LAST CHANGED: 2026-03-06 — Added avatar, age, pending tasks
 */

import Link from "next/link"
import { User } from "lucide-react"
import type { Horse } from "@/lib/types"

interface HorseCardProps {
  horse: Horse
  ownerName: string
  stallLabel: string
  pendingTaskCount: number
}

// BREADCRUMB: Breed colors used for border and avatar background
const breedColors: Record<string, string> = {
  Thoroughbred: "#DC2626",
  Arabian: "#D97706",
  Warmblood: "#2563EB",
  Friesian: "#374151",
  Andalusian: "#7C3AED",
  Hanoverian: "#059669",
  "Irish Sport Horse": "#0891B2",
  Lusitano: "#DB2777",
}

// BREADCRUMB: Calculate age from date of birth
const getAge = (dob: string) => {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--
  return age
}

const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

export function HorseCard({ horse, ownerName, stallLabel, pendingTaskCount }: HorseCardProps) {
  const breedColor = breedColors[horse.breed] ?? "#6B7280"
  const photo = horse.photoUrls?.[0]
  const age = getAge(horse.dateOfBirth)

  return (
    <Link href={`/horses/${horse.id}`}>
      <div className="rounded-lg p-3 sm:p-4 hover:bg-[#252538] transition-colors cursor-pointer active:bg-[#252538] min-h-[80px]" style={{ backgroundColor: "#1A1A2E" }}>
        <div className="flex gap-3">
          {/* Avatar */}
          {photo ? (
            <img src={photo} alt={horse.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ backgroundColor: breedColor }}>
              {getInitials(horse.name)}
            </div>
          )}
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)] truncate">{horse.name}</h3>
              <span className="text-xs text-[var(--text-muted)] flex-shrink-0 ml-2">{stallLabel}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{horse.breed} · {horse.color}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
              <span>{age} years</span>
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{ownerName}</span>
            </div>
            {pendingTaskCount > 0 && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-amber-600/20 text-amber-400 border border-amber-600/30">
                {pendingTaskCount} pending task{pendingTaskCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
