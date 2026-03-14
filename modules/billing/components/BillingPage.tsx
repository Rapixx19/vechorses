/**
 * FILE: modules/billing/components/BillingPage.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Billing page content with client-centric view and transaction log
 * EXPORTS: BillingPage
 * DEPENDS ON: modules/billing, modules/clients
 * CONSUMED BY: app/billing/page.tsx
 * TESTS: modules/billing/tests/BillingPage.test.tsx
 * LAST CHANGED: 2026-03-08 — Extracted from app/billing/page.tsx for SSR fix
 */

// 🔴 RED ZONE — billing data is written by external freelancer, we only read

"use client"

import { useState, useMemo, useEffect } from "react"
import { FileText, Download, X, Plus } from "lucide-react"
import { useBilling } from "../hooks/useBilling"
import { useSettings } from "../hooks/useSettings"
import { BillingStats } from "./BillingStats"
import { BillingFilters, type BillingFilterState } from "./BillingFilters"
import { BillingTable } from "./BillingTable"
import { BillingItemSheet } from "./BillingItemSheet"
import { MonthlyRevenueSummary } from "./MonthlyRevenueSummary"
import { ClientBillingCard } from "./ClientBillingCard"
import { InvoiceBuilder } from "./InvoiceBuilder"
import { useClients } from "@/modules/clients"
import type { BillingLineItem, BillingStatus, Client } from "@/lib/types"

type ViewTab = "by_client" | "all_transactions"

export function BillingPage() {
  // All hooks must be called before any conditional returns
  const { items: billingItems, isLoading: billingLoading } = useBilling()
  const { clients, isLoading: clientsLoading } = useClients()
  const settings = useSettings()
  const [localItems, setLocalItems] = useState<BillingLineItem[]>([])
  const [activeTab, setActiveTab] = useState<ViewTab>("by_client")

  // Sync localItems with billingItems from hook
  useEffect(() => {
    setLocalItems(billingItems)
  }, [billingItems])
  const [filters, setFilters] = useState<BillingFilterState>({ search: "", status: "all", serviceType: "all", dateRange: "all" })
  const [selectedItem, setSelectedItem] = useState<BillingLineItem | null>(null)
  const [showClientPicker, setShowClientPicker] = useState(false)
  const [invoiceClient, setInvoiceClient] = useState<{ client: Client | null; items: BillingLineItem[] } | null>(null)

  // BREADCRUMB: All hooks must be called before any conditional returns (React rules of hooks)
  // Group items by client for client-centric view
  const clientsWithItems = useMemo(() => {
    const grouped = new Map<string, BillingLineItem[]>()
    localItems.forEach((item) => {
      const existing = grouped.get(item.clientId) || []
      grouped.set(item.clientId, [...existing, item])
    })
    return clients
      .filter((c) => grouped.has(c.id))
      .map((c) => ({ client: c, items: grouped.get(c.id) || [] }))
      .sort((a, b) => {
        const aPending = a.items.some((i) => i.status === "pending")
        const bPending = b.items.some((i) => i.status === "pending")
        if (aPending && !bPending) return -1
        if (!aPending && bPending) return 1
        return a.client.fullName.localeCompare(b.client.fullName)
      })
  }, [localItems, clients])

  // Filter items for table view
  const filteredItems = useMemo(() => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1)

    return localItems.filter((item) => {
      const clientName = clients.find((c) => c.id === item.clientId)?.fullName?.toLowerCase() || ""
      const searchMatch = filters.search === "" || clientName.includes(filters.search.toLowerCase()) || item.description.toLowerCase().includes(filters.search.toLowerCase())
      const statusMatch = filters.status === "all" || item.status === filters.status
      const serviceMatch = filters.serviceType === "all" || item.serviceType === filters.serviceType
      const itemDate = new Date(item.serviceDate)
      let dateMatch = true
      if (filters.dateRange === "this_month") dateMatch = itemDate >= thisMonth
      else if (filters.dateRange === "last_month") dateMatch = itemDate >= lastMonth && itemDate < thisMonth
      else if (filters.dateRange === "last_3_months") dateMatch = itemDate >= last3Months
      return searchMatch && statusMatch && serviceMatch && dateMatch
    })
  }, [localItems, clients, filters])

  if (clientsLoading || billingLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="animate-pulse rounded-lg bg-[#1A1D24] h-8 w-24" style={{ background: "linear-gradient(90deg, #1A1D24 25%, #21252E 50%, #1A1D24 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          <div className="flex items-center gap-2">
            <div className="animate-pulse rounded-lg bg-[#1A1D24] h-10 w-32" style={{ background: "linear-gradient(90deg, #1A1D24 25%, #21252E 50%, #1A1D24 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
            <div className="animate-pulse rounded-lg bg-[#1A1D24] h-10 w-36" style={{ background: "linear-gradient(90deg, #1A1D24 25%, #21252E 50%, #1A1D24 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
            <div className="animate-pulse rounded-lg bg-[#1A1D24] h-10 w-28" style={{ background: "linear-gradient(90deg, #1A1D24 25%, #21252E 50%, #1A1D24 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          </div>
        </div>
        <div className="animate-pulse rounded-lg bg-[#1A1D24] h-24 w-full" style={{ background: "linear-gradient(90deg, #1A1D24 25%, #21252E 50%, #1A1D24 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        <div className="animate-pulse rounded-lg bg-[#1A1D24] h-32 w-full" style={{ background: "linear-gradient(90deg, #1A1D24 25%, #21252E 50%, #1A1D24 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        <div className="animate-pulse rounded-lg bg-[#1A1D24] h-12 w-full" style={{ background: "linear-gradient(90deg, #1A1D24 25%, #21252E 50%, #1A1D24 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg bg-[#1A1D24] h-40" style={{ background: "linear-gradient(90deg, #1A1D24 25%, #21252E 50%, #1A1D24 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          ))}
        </div>
      </div>
    )
  }

  const handleStatusChange = (itemId: string, newStatus: BillingStatus) => {
    setLocalItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: newStatus } : i)))
    setSelectedItem(null)
  }

  const handleClientStatusChange = (clientId: string, newStatus: BillingStatus) => {
    setLocalItems((prev) => prev.map((i) => (i.clientId === clientId && i.status === "pending" ? { ...i, status: newStatus } : i)))
  }

  const handleDelete = (itemId: string) => {
    setLocalItems((prev) => prev.filter((i) => i.id !== itemId))
    setSelectedItem(null)
  }

  const handleGenerateBill = (client: Client) => {
    const clientItems = localItems.filter((i) => i.clientId === client.id && i.status === "pending")
    setInvoiceClient({ client, items: clientItems })
    setShowClientPicker(false)
  }

  const handleSelectCustomRecipient = () => {
    setInvoiceClient({ client: null, items: [] })
    setShowClientPicker(false)
  }

  const handleGenerateAllInvoices = () => {
    alert("Generate all invoices — coming in V2")
  }

  const handleExportCsv = () => {
    alert("Export CSV — coming in V2")
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Billing</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowClientPicker(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-3 min-h-[44px] rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#2C5F2E" }}>
            <FileText className="h-4 w-4" /><span className="hidden sm:inline">Generate</span> Bill
          </button>
          <button onClick={handleGenerateAllInvoices} className="hidden sm:flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-md text-sm font-medium bg-blue-900/30 text-blue-400 hover:bg-blue-900/50">
            <FileText className="h-4 w-4" />Generate All
          </button>
          <button onClick={handleExportCsv} className="hidden sm:flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-md text-sm font-medium bg-[#1A1A2E] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <Download className="h-4 w-4" />Export
          </button>
        </div>
      </div>

      <BillingStats items={localItems} />
      <MonthlyRevenueSummary items={localItems} />

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: "#1A1A2E" }}>
        <button
          onClick={() => setActiveTab("by_client")}
          className={`flex-1 px-3 sm:px-4 py-3 min-h-[44px] rounded-md text-xs sm:text-sm font-medium transition-colors ${activeTab === "by_client" ? "bg-[#2C5F2E] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
        >
          By Client
        </button>
        <button
          onClick={() => setActiveTab("all_transactions")}
          className={`flex-1 px-3 sm:px-4 py-3 min-h-[44px] rounded-md text-xs sm:text-sm font-medium transition-colors ${activeTab === "all_transactions" ? "bg-[#2C5F2E] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
        >
          Transactions
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "by_client" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientsWithItems.map(({ client, items }) => (
            <ClientBillingCard
              key={client.id}
              client={client}
              items={items}
              onStatusChange={handleClientStatusChange}
              onGenerateInvoice={() => setInvoiceClient({ client, items: items.filter((i) => i.status === "pending") })}
            />
          ))}
          {clientsWithItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-[var(--text-muted)]">No billing items found</div>
          )}
        </div>
      ) : (
        <>
          <BillingFilters filters={filters} onChange={setFilters} />
          <BillingTable items={filteredItems} clients={clients} onItemClick={setSelectedItem} />
        </>
      )}

      {selectedItem && (
        <BillingItemSheet
          item={selectedItem}
          client={clients.find((c) => c.id === selectedItem.clientId) || null}
          onClose={() => setSelectedItem(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}

      {/* Client Picker for Generate Bill */}
      {showClientPicker && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowClientPicker(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-80 h-full bg-[#0F1117] border-l border-[var(--border)] p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowClientPicker(false)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-4">Select Client</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">Choose a client to generate an invoice for</p>
            <div className="space-y-2">
              {/* Custom Recipient Option */}
              <div
                onClick={handleSelectCustomRecipient}
                className="p-4 border border-dashed border-[#2a2a3e] rounded-lg mb-3 cursor-pointer hover:border-green-500 hover:bg-[#1A1A2E] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Custom Recipient</p>
                    <p className="text-[var(--text-muted)] text-sm">Bill someone not in your client list</p>
                  </div>
                </div>
              </div>

              {clients.filter((c) => c.isActive).map((client) => {
                const pendingCount = localItems.filter((i) => i.clientId === client.id && i.status === "pending").length
                return (
                  <button
                    key={client.id}
                    onClick={() => handleGenerateBill(client)}
                    className="w-full text-left px-4 py-3 rounded-md bg-[#1A1A2E] hover:bg-[#252538] transition-colors"
                  >
                    <div className="font-medium text-[var(--text-primary)]">{client.fullName}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {pendingCount > 0 ? `${pendingCount} pending item${pendingCount > 1 ? "s" : ""}` : "No pending items"}
                    </div>
                  </button>
                )
              })}
              {clients.filter((c) => c.isActive).length === 0 && (
                <p className="text-center py-8 text-[var(--text-muted)]">No clients found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {invoiceClient && (
        <InvoiceBuilder
          clientId={invoiceClient.client?.id || null}
          client={invoiceClient.client}
          lineItems={invoiceClient.items}
          settings={settings}
          onClose={() => setInvoiceClient(null)}
          onSave={() => {
            // Invoice is created by InvoiceBuilder via useCreateInvoice hook
            // Mark included line items as invoiced in local state
            if (invoiceClient.items.length > 0) {
              setLocalItems((prev) => prev.map((i) => (invoiceClient.items.some((ii) => ii.id === i.id) ? { ...i, status: "invoiced" as const } : i)))
            }
            setInvoiceClient(null)
          }}
        />
      )}
    </div>
  )
}
