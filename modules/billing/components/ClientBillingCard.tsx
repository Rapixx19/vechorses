/**
 * FILE: modules/billing/components/ClientBillingCard.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Client-centric billing card with grouped line items and actions
 * EXPORTS: ClientBillingCard
 * DEPENDS ON: lib/types.ts, PaymentStatusBar, lucide-react
 * CONSUMED BY: app/billing/page.tsx
 * TESTS: modules/billing/tests/ClientBillingCard.test.tsx
 * LAST CHANGED: 2026-03-07 — Removed Add Item button, simplified to Generate Invoice only
 */

// 🔴 RED ZONE — billing module, handle with care

"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, FileText } from "lucide-react"
import { PaymentStatusBar } from "./PaymentStatusBar"
import type { BillingLineItem, BillingStatus, Client, ServiceType } from "@/lib/types"

interface ClientBillingCardProps {
  client: Client
  items: BillingLineItem[]
  onStatusChange: (clientId: string, newStatus: BillingStatus) => void
  onGenerateInvoice: (clientId: string) => void
}

const serviceColors: Record<ServiceType, string> = {
  boarding: "border-purple-600/40 text-purple-400",
  lesson: "border-blue-600/40 text-blue-400",
  farrier: "border-amber-600/40 text-amber-400",
  vet: "border-red-600/40 text-red-400",
  other: "border-gray-500/40 text-gray-400",
}

const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

export function ClientBillingCard({ client, items, onStatusChange, onGenerateInvoice }: ClientBillingCardProps) {
  const [expanded, setExpanded] = useState(false)

  const total = items.reduce((sum, i) => sum + i.amountCents, 0)
  const pending = items.filter((i) => i.status === "pending").length
  const invoiced = items.filter((i) => i.status === "invoiced").length
  const paid = items.filter((i) => i.status === "paid").length

  const formatAmount = (cents: number) => `€${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}`
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })

  const statusSummary = [pending > 0 && `${pending} pending`, invoiced > 0 && `${invoiced} invoiced`, paid > 0 && `${paid} paid`].filter(Boolean).join(" • ")

  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
      <PaymentStatusBar items={items} onStatusChange={(status) => onStatusChange(client.id, status)} />

      <div className="p-4">
        {/* Client Header */}
        <div className="flex items-center gap-3 mb-3">
          {client.photoUrl ? (
            <img src={client.photoUrl} alt={client.fullName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: "#2C5F2E" }}>
              {getInitials(client.fullName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--text-primary)] truncate">{client.fullName}</p>
            <p className="text-xs text-[var(--text-muted)] truncate">{client.email}</p>
          </div>
        </div>

        {/* Summary Row */}
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-[var(--text-muted)]">{items.length} items • {formatAmount(total)}</span>
          <span className="text-xs text-[var(--text-muted)]">{statusSummary}</span>
        </div>

        {/* Expandable Items */}
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-3">
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Hide items" : "Show items"}
        </button>

        {expanded && (
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded bg-[#0F1117] text-sm">
                <span className="text-xs text-[var(--text-muted)] w-14">{formatDate(item.serviceDate)}</span>
                <span className={`px-1.5 py-0.5 rounded border text-[9px] capitalize ${serviceColors[item.serviceType]}`}>{item.serviceType}</span>
                <span className="flex-1 text-[var(--text-primary)] truncate">{item.description}</span>
                <span className="text-[var(--text-primary)] font-medium">{formatAmount(item.amountCents)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <button onClick={() => onGenerateInvoice(client.id)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium text-white" style={{ backgroundColor: "#2C5F2E" }}>
          <FileText className="h-4 w-4" />Generate Invoice
        </button>
      </div>
    </div>
  )
}
