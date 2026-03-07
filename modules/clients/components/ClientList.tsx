/**
 * FILE: modules/clients/components/ClientList.tsx
 * ZONE: Green
 * PURPOSE: Searchable list of all clients with add button
 * EXPORTS: ClientList
 * DEPENDS ON: useClients, useHorses, useBilling, ClientCard, Skeleton
 * CONSUMED BY: app/clients/page.tsx
 * TESTS: modules/clients/tests/ClientList.test.tsx
 * LAST CHANGED: 2026-03-07 — UI overhaul with skeleton loading
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Users } from "lucide-react"
import { useClients } from "@/modules/clients"
import { useHorses } from "@/modules/horses"
import { useBilling } from "@/modules/billing"
import { Skeleton } from "@/modules/dashboard"
import { ClientCard } from "./ClientCard"

// BREADCRUMB: Skeleton loading state for ClientList
function ClientListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}

export function ClientList() {
  const [search, setSearch] = useState("")
  const { clients, isLoading: clientsLoading } = useClients()
  const { horses, isLoading: horsesLoading } = useHorses()
  const { items: billingItems, isLoading: billingLoading } = useBilling()

  const isLoading = clientsLoading || horsesLoading || billingLoading

  // BREADCRUMB: Count horses per client for display
  const getHorseCount = (clientId: string) =>
    horses.filter((h) => h.ownerId === clientId).length

  const activeClients = clients.filter((c) => c.isActive)

  if (isLoading) {
    return <ClientListSkeleton />
  }

  const filteredClients = activeClients.filter(
    (client) =>
      client.fullName.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[var(--text-muted)] text-sm">{activeClients.length} clients</p>
        <Link href="/clients/new" className="btn btn-primary min-h-[44px]">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Client</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10 min-h-[44px]"
        />
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <ClientCard key={client.id} client={client} horseCount={getHorseCount(client.id)} billingItems={billingItems} />
        ))}
      </div>

      {/* Empty state */}
      {filteredClients.length === 0 && activeClients.length === 0 && (
        <div className="empty-state card">
          <Users className="h-12 w-12 text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-primary)] font-medium mb-2">No clients yet</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">Add your first client to start managing horse owners</p>
          <Link href="/clients/new" className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Add your first client
          </Link>
        </div>
      )}

      {filteredClients.length === 0 && activeClients.length > 0 && (
        <p className="text-center text-[var(--text-muted)] py-8">No clients match your search</p>
      )}
    </div>
  )
}
