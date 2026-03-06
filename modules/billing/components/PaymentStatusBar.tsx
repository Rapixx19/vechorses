/**
 * FILE: modules/billing/components/PaymentStatusBar.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Payment status indicator with action buttons for client billing cards
 * EXPORTS: PaymentStatusBar
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: ClientBillingCard
 * TESTS: modules/billing/tests/PaymentStatusBar.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

// 🔴 RED ZONE — billing module, handle with care

import { AlertCircle, Clock, CheckCircle, Download } from "lucide-react"
import type { BillingLineItem, BillingStatus } from "@/lib/types"

interface PaymentStatusBarProps {
  items: BillingLineItem[]
  onStatusChange: (newStatus: BillingStatus) => void
}

export function PaymentStatusBar({ items, onStatusChange }: PaymentStatusBarProps) {
  const pending = items.filter((i) => i.status === "pending")
  const invoiced = items.filter((i) => i.status === "invoiced")
  const allPaid = items.length > 0 && items.every((i) => i.status === "paid" || i.status === "cancelled")

  const pendingAmount = pending.reduce((sum, i) => sum + i.amountCents, 0)
  const invoicedAmount = invoiced.reduce((sum, i) => sum + i.amountCents, 0)
  const formatAmount = (cents: number) => `€${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}`

  if (pending.length > 0) {
    return (
      <div className="flex items-center justify-between p-3 rounded-t-lg bg-red-900/20 border-l-4 border-red-500">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Outstanding — {formatAmount(pendingAmount)} unpaid</span>
        </div>
        <button onClick={() => onStatusChange("invoiced")} className="px-3 py-1 text-xs font-medium rounded bg-blue-900/30 text-blue-400 hover:bg-blue-900/50">
          Mark Invoice Sent
        </button>
      </div>
    )
  }

  if (invoiced.length > 0) {
    return (
      <div className="flex items-center justify-between p-3 rounded-t-lg bg-blue-900/20 border-l-4 border-blue-500">
        <div className="flex items-center gap-2 text-blue-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Invoice Sent — {formatAmount(invoicedAmount)} awaiting payment</span>
        </div>
        <button onClick={() => onStatusChange("paid")} className="px-3 py-1 text-xs font-medium rounded bg-green-900/30 text-green-400 hover:bg-green-900/50">
          Confirm Payment Received
        </button>
      </div>
    )
  }

  if (allPaid) {
    return (
      <div className="flex items-center justify-between p-3 rounded-t-lg bg-green-900/20 border-l-4 border-green-500">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">All Paid</span>
        </div>
        <button onClick={() => alert("Invoice download available in V2")} className="px-3 py-1 text-xs font-medium rounded bg-[#1A1A2E] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <Download className="h-3 w-3 inline mr-1" />Download Invoice
        </button>
      </div>
    )
  }

  return null
}
