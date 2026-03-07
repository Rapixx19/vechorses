/**
 * FILE: modules/clients/components/ClientList.tsx
 * ZONE: Green
 * PURPOSE: Searchable list of all clients with add button
 * EXPORTS: ClientList
 * DEPENDS ON: useClients, useHorses, useBilling, ClientCard
 * CONSUMED BY: app/clients/page.tsx
 * TESTS: modules/clients/tests/ClientList.test.tsx
 * LAST CHANGED: 2026-03-06 — Added billing data for revenue badge
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { useClients } from "@/modules/clients"
import { useHorses } from "@/modules/horses"
import { useBilling } from "@/modules/billing"
import { ClientCard } from "./ClientCard"

export function ClientList() {
  const [search, setSearch] = useState("")
  const { clients, isLoading: clientsLoading } = useClients()
  const { horses, isLoading: horsesLoading } = useHorses()
  const billingItems = useBilling()

  const isLoading = clientsLoading || horsesLoading

  // BREADCRUMB: Count horses per client for display
  const getHorseCount = (clientId: string) =>
    horses.filter((h) => h.ownerId === clientId).length

  const activeClients = clients.filter((c) => c.isActive)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C5F2E]" />
      </div>
    )
  }
  const filteredClients = activeClients.filter(
    (client) =>
      client.fullName.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[var(--text-muted)]">{activeClients.length} clients</p>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
          style={{ backgroundColor: "#2C5F2E" }}
        >
          <Plus className="h-4 w-4" />
          Add Client
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
          className="w-full pl-10 pr-4 py-2 rounded-md bg-[#1A1A2E] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
        />
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <ClientCard key={client.id} client={client} horseCount={getHorseCount(client.id)} billingItems={billingItems} />
        ))}
      </div>

      {filteredClients.length === 0 && activeClients.length === 0 && (
        <div className="text-center py-12 rounded-lg" style={{ backgroundColor: "#1A1A2E" }}>
          <p className="text-[var(--text-primary)] font-medium mb-2">No clients yet</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">Add your first client to start managing horse owners</p>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
            style={{ backgroundColor: "#2C5F2E" }}
          >
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
