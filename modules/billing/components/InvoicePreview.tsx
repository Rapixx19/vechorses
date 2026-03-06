/**
 * FILE: modules/billing/components/InvoicePreview.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Clean professional invoice layout for preview and PDF
 * EXPORTS: InvoicePreview
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: InvoiceBuilder, generatePdf
 * TESTS: modules/billing/tests/InvoicePreview.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for Phase 7b
 */

// 🔴 RED ZONE — billing invoice preview, handle with care

import type { Invoice, Client, StableSettings } from "@/lib/types"

interface InvoicePreviewProps {
  invoice: Invoice
  client: Client
  settings: StableSettings
}

const formatAmount = (cents: number) => `€${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}`
const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

export function InvoicePreview({ invoice, client, settings }: InvoicePreviewProps) {
  return (
    <div id="invoice-preview" className="bg-white text-black p-8 min-h-[297mm] w-full max-w-[210mm] mx-auto font-sans text-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
        <div>
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.stableName} className="h-16 object-contain" />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{settings.stableName}</h1>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
          <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
          <p className="text-gray-600 mt-2">Issue Date: {formatDate(invoice.issuedDate)}</p>
          <p className="text-gray-600">Due Date: {formatDate(invoice.dueDate)}</p>
        </div>
      </div>

      {/* From / To */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">From</h3>
          <p className="font-semibold">{settings.stableName}</p>
          <p>{settings.address}</p>
          <p>{settings.city}</p>
          <p>{settings.country}</p>
          <p className="mt-2">{settings.phone}</p>
          <p>{settings.email}</p>
          {settings.vatNumber && <p className="mt-2">VAT: {settings.vatNumber}</p>}
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
          <p className="font-semibold">{client.fullName}</p>
          <p>{client.email}</p>
          <p>{client.phone}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase w-12">#</th>
            <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
            <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase w-24">Date</th>
            <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase w-28">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map((item, idx) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-3 text-gray-600">{idx + 1}</td>
              <td className="py-3">{item.description}</td>
              <td className="py-3 text-gray-600">{formatDate(item.serviceDate)}</td>
              <td className="py-3 text-right">{formatAmount(item.amountCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatAmount(invoice.subtotal)}</span>
          </div>
          {invoice.taxRate && invoice.taxRate > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Tax ({invoice.taxRate}%)</span>
              <span>{formatAmount(invoice.tax || 0)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 text-lg font-bold">
            <span>Total</span>
            <span>{formatAmount(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      {(settings.bankName || settings.bankIban) && (
        <div className="mb-8 p-4 bg-gray-50 rounded">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment Details</h3>
          {settings.bankName && <p>Bank: {settings.bankName}</p>}
          {settings.bankIban && <p>IBAN: {settings.bankIban}</p>}
          {settings.bankBic && <p>BIC: {settings.bankBic}</p>}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-gray-200 text-center text-gray-500 text-xs">
        {invoice.notes && <p className="mb-2">{invoice.notes}</p>}
        {settings.invoiceNotes && <p className="mb-2">{settings.invoiceNotes}</p>}
        {settings.invoiceFooter && <p className="italic">{settings.invoiceFooter}</p>}
      </div>
    </div>
  )
}
