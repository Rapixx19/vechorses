/**
 * FILE: modules/billing/components/InvoiceLineItemRow.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Editable line item row for invoice builder
 * EXPORTS: InvoiceLineItemRow
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: InvoiceBuilder
 * TESTS: modules/billing/tests/InvoiceLineItemRow.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for Phase 7b
 */

// 🔴 RED ZONE — billing invoice builder, handle with care

import { Trash2 } from "lucide-react"
import type { BillingLineItem } from "@/lib/types"

interface InvoiceLineItemRowProps {
  item: BillingLineItem
  included: boolean
  onToggle: () => void
  onUpdate: (updates: Partial<BillingLineItem>) => void
  onRemove: () => void
  isCustom?: boolean
}

export function InvoiceLineItemRow({ item, included, onToggle, onUpdate, onRemove, isCustom }: InvoiceLineItemRowProps) {
  const inputClass = "w-full px-2 py-1 rounded bg-[#252538] border border-[var(--border)] text-sm text-[var(--text-primary)]"
  const formatAmount = (cents: number) => (cents / 100).toFixed(2)

  return (
    <div className={`flex items-center gap-2 p-2 rounded ${included ? "bg-[#1A1A2E]" : "bg-[#0F1117] opacity-50"}`}>
      <input type="checkbox" checked={included} onChange={onToggle} className="h-4 w-4 accent-[#2C5F2E]" />
      <input
        type="text"
        value={item.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        className={`${inputClass} flex-1`}
        placeholder="Description"
      />
      <input
        type="number"
        step="0.01"
        value={formatAmount(item.amountCents)}
        onChange={(e) => onUpdate({ amountCents: Math.round(parseFloat(e.target.value || "0") * 100) })}
        className={`${inputClass} w-24 text-right`}
        placeholder="0.00"
      />
      {isCustom && (
        <button onClick={onRemove} className="p-1 text-red-400 hover:text-red-300">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
