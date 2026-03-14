/**
 * FILE: modules/billing/components/InvoiceDocument.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Shared invoice document component for preview, PDF, and email
 * EXPORTS: InvoiceDocument, InvoiceDocumentProps
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: InvoiceBuilder, InvoicePreview, SendInvoiceModal, /api/send-invoice
 * TESTS: modules/billing/tests/InvoiceDocument.test.tsx
 * LAST CHANGED: 2026-03-14 — Initial creation with full personalization
 */

// 🔴 RED ZONE — billing invoice document, handle with care

import type { Invoice, StableSettings } from "@/lib/types"

export interface InvoiceDocumentProps {
  invoice: Invoice
  stable: {
    name: string
    address?: string
    city?: string
    country?: string
    phone?: string
    email?: string
    website?: string
    logoUrl?: string
    logoData?: string
    vatNumber?: string
    bankName?: string
    iban?: string
    bic?: string
    accentColor?: string
    footerNote?: string
    paymentTermsDays?: number
    currency?: string
  }
  showWatermark?: boolean // "DRAFT" or "PAID" watermark
}

// Convert StableSettings to the stable prop format
export function settingsToStableProp(settings: StableSettings): InvoiceDocumentProps["stable"] {
  return {
    name: settings.stableName,
    address: settings.address,
    city: settings.city,
    country: settings.country,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
    logoUrl: settings.logoUrl,
    logoData: settings.logoData,
    vatNumber: settings.vatNumber,
    bankName: settings.bankName,
    iban: settings.bankIban,
    bic: settings.bankBic,
    accentColor: settings.invoiceAccentColor,
    footerNote: settings.invoiceFooterNote || settings.invoiceFooter,
    paymentTermsDays: settings.paymentTermsDays,
    currency: settings.currency,
  }
}

const formatAmount = (cents: number, currency: string = "EUR") => {
  const value = (cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })
  return `${currency} ${value}`
}

const formatDate = (d: string) => {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export function InvoiceDocument({ invoice, stable, showWatermark }: InvoiceDocumentProps) {
  const accentColor = stable.accentColor || "#2C5F2E"
  const recipient = invoice.recipientInfo
  const currency = stable.currency || "EUR"

  // Calculate due date based on payment terms if not specified
  const dueDate = invoice.dueDate
  const paymentTerms = stable.paymentTermsDays || 30

  return (
    <div
      className="invoice-document bg-white text-black p-8 min-h-[297mm] w-full max-w-[210mm] mx-auto font-sans text-sm relative"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* Watermark */}
      {showWatermark && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <span
            className={`text-8xl font-bold opacity-10 rotate-[-30deg] ${
              invoice.status === "paid" ? "text-green-600" : "text-gray-600"
            }`}
          >
            {invoice.status === "paid" ? "PAID" : invoice.status === "draft" ? "DRAFT" : ""}
          </span>
        </div>
      )}

      {/* Header with Logo and Invoice Info */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b-2" style={{ borderColor: accentColor }}>
        <div>
          {stable.logoData ? (
            <img
              src={stable.logoData}
              alt={stable.name}
              style={{ maxHeight: "80px", maxWidth: "200px", objectFit: "contain" }}
            />
          ) : stable.logoUrl ? (
            <img
              src={stable.logoUrl}
              alt={stable.name}
              style={{ maxHeight: "80px", maxWidth: "200px", objectFit: "contain" }}
            />
          ) : (
            <h1 className="text-2xl font-bold" style={{ color: accentColor }}>
              {stable.name}
            </h1>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold mb-2" style={{ color: accentColor }}>
            INVOICE
          </h2>
          <p className="text-lg font-semibold text-gray-800">{invoice.invoiceNumber}</p>
          <p className="text-gray-600 mt-2">Issue Date: {formatDate(invoice.issuedDate)}</p>
          <p className="text-gray-600">Due Date: {formatDate(dueDate)}</p>
        </div>
      </div>

      {/* From / Bill To Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3
            className="text-xs font-semibold uppercase mb-2"
            style={{ color: accentColor }}
          >
            From
          </h3>
          <p className="font-semibold text-gray-900">{stable.name}</p>
          {stable.address && <p className="text-gray-700">{stable.address}</p>}
          {(stable.city || stable.country) && (
            <p className="text-gray-700">
              {[stable.city, stable.country].filter(Boolean).join(", ")}
            </p>
          )}
          {stable.phone && <p className="text-gray-600 mt-2">{stable.phone}</p>}
          {stable.email && <p className="text-gray-600">{stable.email}</p>}
          {stable.website && <p className="text-gray-600">{stable.website}</p>}
          {stable.vatNumber && (
            <p className="text-gray-600 mt-2">VAT/Tax No: {stable.vatNumber}</p>
          )}
        </div>
        <div>
          <h3
            className="text-xs font-semibold uppercase mb-2"
            style={{ color: accentColor }}
          >
            Bill To
          </h3>
          {recipient ? (
            <>
              <p className="font-semibold text-gray-900">{recipient.fullName}</p>
              {recipient.companyName && (
                <p className="text-gray-700">{recipient.companyName}</p>
              )}
              {recipient.email && <p className="text-gray-600">{recipient.email}</p>}
              {recipient.address && <p className="text-gray-700">{recipient.address}</p>}
              {(recipient.city || recipient.country) && (
                <p className="text-gray-700">
                  {[recipient.city, recipient.country].filter(Boolean).join(", ")}
                </p>
              )}
              {recipient.vatNumber && (
                <p className="text-gray-600 mt-2">VAT: {recipient.vatNumber}</p>
              )}
            </>
          ) : (
            <p className="text-gray-400 italic">No recipient specified</p>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <table className="w-full mb-8 avoid-break">
        <thead>
          <tr style={{ backgroundColor: `${accentColor}15` }}>
            <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase w-12">
              #
            </th>
            <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">
              Description
            </th>
            <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase w-24">
              Date
            </th>
            <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase w-28">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map((item, idx) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-3 px-2 text-gray-600">{idx + 1}</td>
              <td className="py-3 px-2 text-gray-900">{item.description}</td>
              <td className="py-3 px-2 text-gray-600">{formatDate(item.serviceDate)}</td>
              <td className="py-3 px-2 text-right text-gray-900">
                {formatAmount(item.amountCents, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatAmount(invoice.subtotal, currency)}</span>
          </div>
          {invoice.taxRate && invoice.taxRate > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Tax ({invoice.taxRate}%)</span>
              <span className="text-gray-900">
                {formatAmount(invoice.tax || 0, currency)}
              </span>
            </div>
          )}
          <div
            className="flex justify-between py-3 text-lg font-bold border-t-2"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            <span>TOTAL</span>
            <span>{formatAmount(invoice.total, currency)}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      {(stable.bankName || stable.iban) && (
        <div className="mb-8 p-4 bg-gray-50 rounded avoid-break">
          <h3 className="text-xs font-semibold text-gray-600 uppercase mb-2">
            Payment Details
          </h3>
          {stable.bankName && (
            <p className="text-gray-700">Bank: {stable.bankName}</p>
          )}
          {stable.iban && <p className="text-gray-700">IBAN: {stable.iban}</p>}
          {stable.bic && <p className="text-gray-700">BIC/SWIFT: {stable.bic}</p>}
          <p className="text-gray-700">Reference: {invoice.invoiceNumber}</p>
        </div>
      )}

      {/* Payment Terms */}
      {paymentTerms && (
        <p className="text-sm text-gray-600 mb-4">
          Payment due within {paymentTerms} days of invoice date.
        </p>
      )}

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-700">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-gray-200 text-center text-gray-500 text-xs">
        {stable.footerNote && (
          <p className="mb-2 text-gray-600">{stable.footerNote}</p>
        )}
        <p className="text-gray-400">
          {stable.name} {stable.website ? `· ${stable.website}` : ""}
        </p>
      </div>

      {/* Paid Stamp */}
      {invoice.status === "paid" && (
        <div
          className="absolute bottom-20 right-8 px-6 py-2 border-4 rounded-lg rotate-[-15deg]"
          style={{
            borderColor: "#22c55e",
            color: "#22c55e",
          }}
        >
          <span className="text-3xl font-bold tracking-wider">PAID</span>
        </div>
      )}
    </div>
  )
}
