/**
 * FILE: modules/billing/components/InvoiceHistoryTable.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Table displaying all past invoices with download option
 * EXPORTS: InvoiceHistoryTable
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: app/settings/page.tsx
 * TESTS: modules/billing/tests/InvoiceHistoryTable.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for Phase 7b
 */

// 🔴 RED ZONE — billing invoice history, handle with care

import { Download } from "lucide-react"
import type { Invoice, Client } from "@/lib/types"

interface InvoiceHistoryTableProps {
  invoices: Invoice[]
  clients: Client[]
  onDownload: (invoice: Invoice) => void
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  sent: "bg-blue-500/20 text-blue-400",
  paid: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
}

export function InvoiceHistoryTable({ invoices, clients, onDownload }: InvoiceHistoryTableProps) {
  const formatAmount = (cents: number) => `€${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}`
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  const getClientName = (clientId: string) => clients.find((c) => c.id === clientId)?.fullName || "Unknown"

  if (invoices.length === 0) {
    return <p className="text-center text-[var(--text-muted)] py-8">No invoices yet</p>
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#1A1A2E" }}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Invoice</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Client</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Date</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Total</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Status</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[#252538]">
              <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">{invoice.invoiceNumber}</td>
              <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{getClientName(invoice.clientId)}</td>
              <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{formatDate(invoice.issuedDate)}</td>
              <td className="px-4 py-3 text-sm text-right text-[var(--text-primary)]">{formatAmount(invoice.total)}</td>
              <td className="px-4 py-3 text-center">
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[invoice.status]}`}>{invoice.status}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <button onClick={() => onDownload(invoice)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]" title="Download PDF">
                  <Download className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
