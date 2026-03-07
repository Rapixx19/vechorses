/**
 * FILE: modules/horses/components/HorseList.tsx
 * ZONE: Green
 * PURPOSE: Searchable list of all horses with add button
 * EXPORTS: HorseList
 * DEPENDS ON: useHorses, useTasks, useClients, useStalls, HorseCard, Skeleton
 * CONSUMED BY: app/horses/page.tsx
 * TESTS: modules/horses/tests/HorseList.test.tsx
 * LAST CHANGED: 2026-03-07 — UI overhaul with skeleton loading
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Rabbit } from "lucide-react"
import { useHorses, useTasks } from "@/modules/horses"
import { useClients } from "@/modules/clients"
import { useStalls } from "@/modules/stalls"
import { Skeleton } from "@/modules/dashboard"
import { HorseCard } from "./HorseCard"

// BREADCRUMB: Skeleton loading state for HorseList
function HorseListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  )
}

export function HorseList() {
  const [search, setSearch] = useState("")
  const { horses, isLoading: horsesLoading } = useHorses()
  const { clients, isLoading: clientsLoading } = useClients()
  const { stalls, isLoading: stallsLoading } = useStalls()
  const { tasks: allTasks, isLoading: tasksLoading } = useTasks()

  const isLoading = horsesLoading || clientsLoading || stallsLoading || tasksLoading

  const getOwnerName = (ownerId: string) =>
    clients.find((c) => c.id === ownerId)?.fullName ?? "Unknown"

  const getStallLabel = (stallId: string | null) =>
    stalls.find((s) => s.id === stallId)?.label ?? "No stall"

  // BREADCRUMB: Count pending tasks for each horse
  const getPendingTaskCount = (horseId: string) =>
    allTasks.filter((t) => t.horseId === horseId && !t.completedAt).length

  const filteredHorses = horses.filter(
    (horse) =>
      horse.name.toLowerCase().includes(search.toLowerCase()) ||
      horse.breed.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return <HorseListSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[var(--text-muted)] text-sm">{horses.length} horses</p>
        <Link href="/horses/new" className="btn btn-primary min-h-[44px]">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Horse</span>
          <span className="sm:hidden">Add</span>
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
          className="input pl-10 min-h-[44px]"
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
            pendingTaskCount={getPendingTaskCount(horse.id)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredHorses.length === 0 && horses.length === 0 && (
        <div className="empty-state card">
          <Rabbit className="h-12 w-12 text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-primary)] font-medium mb-2">No horses yet</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">Add your first horse to get started</p>
          <Link href="/horses/new" className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Add your first horse
          </Link>
        </div>
      )}

      {filteredHorses.length === 0 && horses.length > 0 && (
        <p className="text-center text-[var(--text-muted)] py-8">No horses match your search</p>
      )}
    </div>
  )
}
