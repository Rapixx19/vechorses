/**
 * FILE: modules/horses/components/HorseList.tsx
 * ZONE: Green
 * PURPOSE: Searchable list of all horses with add button
 * EXPORTS: HorseList
 * DEPENDS ON: useHorses, useClients, useStalls, HorseCard
 * CONSUMED BY: app/horses/page.tsx
 * TESTS: modules/horses/tests/HorseList.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { useHorses } from "@/modules/horses"
import { useClients } from "@/modules/clients"
import { useStalls } from "@/modules/stalls"
import { HorseCard } from "./HorseCard"

export function HorseList() {
  const [search, setSearch] = useState("")
  const horses = useHorses()
  const clients = useClients()
  const stalls = useStalls()

  const getOwnerName = (ownerId: string) =>
    clients.find((c) => c.id === ownerId)?.fullName ?? "Unknown"

  const getStallLabel = (stallId: string | null) =>
    stalls.find((s) => s.id === stallId)?.label ?? "No stall"

  const filteredHorses = horses.filter(
    (horse) =>
      horse.name.toLowerCase().includes(search.toLowerCase()) ||
      horse.breed.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[var(--text-muted)]">{horses.length} horses</p>
        <Link
          href="/horses/new"
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
          style={{ backgroundColor: "#2C5F2E" }}
        >
          <Plus className="h-4 w-4" />
          Add Horse
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search by name or breed..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md bg-[#1A1A2E] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
        />
      </div>

      {/* Horse Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHorses.map((horse) => (
          <HorseCard
            key={horse.id}
            horse={horse}
            ownerName={getOwnerName(horse.ownerId)}
            stallLabel={getStallLabel(horse.stallId)}
          />
        ))}
      </div>

      {filteredHorses.length === 0 && (
        <p className="text-center text-[var(--text-muted)] py-8">No horses found</p>
      )}
    </div>
  )
}
