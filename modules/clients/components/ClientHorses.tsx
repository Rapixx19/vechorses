/**
 * FILE: modules/clients/components/ClientHorses.tsx
 * ZONE: Green
 * PURPOSE: Display horses owned by a client
 * EXPORTS: ClientHorses
 * DEPENDS ON: useHorses, useStalls
 * CONSUMED BY: ClientDetail (Horses tab)
 * TESTS: modules/clients/tests/ClientHorses.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

import Link from "next/link"
import { useHorses } from "@/modules/horses"
import { useStalls } from "@/modules/stalls"

interface ClientHorsesProps {
  clientId: string
}

const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

export function ClientHorses({ clientId }: ClientHorsesProps) {
  const horses = useHorses()
  const stalls = useStalls()
  const clientHorses = horses.filter((h) => h.ownerId === clientId)

  const getStallLabel = (stallId: string | null) =>
    stalls.find((s) => s.id === stallId)?.label ?? "No stall"

  if (clientHorses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[var(--text-muted)]">No horses assigned</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {clientHorses.map((horse) => (
        <Link key={horse.id} href={`/horses/${horse.id}`}>
          <div className="flex items-center gap-3 p-3 rounded-md hover:bg-[#252538] transition-colors" style={{ backgroundColor: "#1A1A2E" }}>
            {horse.photoUrls?.[0] ? (
              <img src={horse.photoUrls[0]} alt={horse.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: "#2C5F2E" }}>
                {getInitials(horse.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)]">{horse.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{horse.breed}</p>
            </div>
            <span className="text-xs text-[var(--text-muted)]">{getStallLabel(horse.stallId)}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
