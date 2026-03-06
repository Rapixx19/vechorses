/**
 * FILE: modules/billing/components/BillingItemSheet.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Sheet showing billing item details with status actions
 * EXPORTS: BillingItemSheet
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: app/billing/page.tsx
 * TESTS: modules/billing/tests/BillingItemSheet.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

// 🔴 RED ZONE — billing module, handle with care

"use client"

import { X } from "lucide-react"
import type { BillingLineItem, BillingStatus, Client } from "@/lib/types"

interface BillingItemSheetProps {
  item: BillingLineItem
  client: Client | null
  onClose: () => void
  onStatusChange: (itemId: string, newStatus: BillingStatus) => void
  onDelete: (itemId: string) => void
}

const statusColors: Record<BillingStatus, string> = {
  pending: "text-amber-400",
  invoiced: "text-blue-400",
  paid: "text-green-400",
  cancelled: "text-gray-400",
}

export function BillingItemSheet({ item, client, onClose, onStatusChange, onDelete }: BillingItemSheetProps) {
  const formatAmount = (cents: number) => `€${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}`
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })

  const handleStatusChange = (newStatus: BillingStatus) => {
    onStatusChange(item.id, newStatus)
    alert(`Status updated to ${newStatus}`)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this billing item?")) {
      onDelete(item.id)
      alert("Item deleted")
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-80 h-full bg-[#0F1117] border-l border-[var(--border)] p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-1">Billing Item</h3>
        <p className={`text-sm capitalize mb-6 ${statusColors[item.status]}`}>{item.status}</p>

        <div className="space-y-4 mb-6">
          <InfoRow label="Client" value={client?.fullName || "Unknown"} />
          <InfoRow label="Service" value={item.serviceType} />
          <InfoRow label="Description" value={item.description} />
          <InfoRow label="Amount" value={formatAmount(item.amountCents)} />
          <InfoRow label="Service Date" value={formatDate(item.serviceDate)} />
          <InfoRow label="Created" value={formatDate(item.createdAt)} />
        </div>

        {/* Status Actions */}
        <div className="space-y-2 mb-6">
          {item.status === "pending" && (
            <button onClick={() => handleStatusChange("invoiced")} className="w-full px-4 py-2 rounded-md text-sm font-medium bg-blue-900/30 text-blue-400 hover:bg-blue-900/50">
              Mark as Invoiced
            </button>
          )}
          {item.status === "invoiced" && (
            <button onClick={() => handleStatusChange("paid")} className="w-full px-4 py-2 rounded-md text-sm font-medium bg-green-900/30 text-green-400 hover:bg-green-900/50">
              Mark as Paid
            </button>
          )}
          {(item.status === "pending" || item.status === "invoiced") && (
            <button onClick={() => handleStatusChange("cancelled")} className="w-full px-4 py-2 rounded-md text-sm font-medium bg-gray-900/30 text-gray-400 hover:bg-gray-900/50">
              Cancel
            </button>
          )}
        </div>

        <button onClick={handleDelete} className="w-full px-4 py-2 rounded-md text-sm font-medium text-red-400 border border-red-400/30 hover:bg-red-400/10">
          Delete Item
        </button>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <p className="text-[var(--text-muted)] text-xs mb-0.5">{label}</p>
      <p className="text-[var(--text-primary)]">{value}</p>
    </div>
  )
}
