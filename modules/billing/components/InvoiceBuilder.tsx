/**
 * FILE: modules/billing/components/InvoiceBuilder.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Invoice creation dialog with live preview and Supabase integration
 * EXPORTS: InvoiceBuilder
 * DEPENDS ON: lib/types.ts, InvoicePreview, ServiceComboInput, generatePdf, useCreateInvoice, useClients, useServices, lucide-react
 * CONSUMED BY: ClientBillingCard, app/billing/page.tsx
 * TESTS: modules/billing/tests/InvoiceBuilder.test.tsx
 * LAST CHANGED: 2026-03-08 — Redesigned line items with service combo input, quick-add buttons, mobile layout
 */

// 🔴 RED ZONE — billing invoice builder, handle with care

"use client"

import { useState, useMemo } from "react"
import { X, Plus, Eye, Download, Send, Save, User, Building2, Trash2 } from "lucide-react"
import { InvoicePreview } from "./InvoicePreview"
import { ServiceComboInput } from "./ServiceComboInput"
import { generateInvoicePdf } from "../services/generatePdf"
import { useCreateInvoice } from "../hooks/useInvoices"
import { useClients } from "@/modules/clients"
import { useServices } from "@/modules/services"
import type { Client, BillingLineItem, StableSettings, Invoice, InvoiceStatus, RecipientType, RecipientInfo, Service } from "@/lib/types"

// New line item interface with service support
interface InvoiceLineItem {
  id: string
  description: string
  serviceId: string | null
  quantity: number
  unitPrice: number
  taxRate: number
  total: number
}

interface InvoiceBuilderProps {
  clientId?: string | null
  client?: Client | null
  lineItems: BillingLineItem[]
  settings: StableSettings
  onClose: () => void
  onSave: (invoice: Invoice) => void
}

// Helper to convert InvoiceLineItem to BillingLineItem for invoice
function lineItemToBillingItem(item: InvoiceLineItem, clientId: string | null, currency: string, issueDate: string): BillingLineItem {
  return {
    id: item.id,
    clientId: clientId || "",
    serviceType: "other",
    description: item.description,
    amountCents: item.total,
    currency,
    status: "pending",
    serviceDate: issueDate,
    createdAt: new Date().toISOString(),
  }
}

export function InvoiceBuilder({ clientId: initialClientId, client: initialClient, lineItems, settings, onClose, onSave }: InvoiceBuilderProps) {
  const { createInvoice } = useCreateInvoice()
  const { clients } = useClients()
  const { services } = useServices()

  // Recipient state
  const [recipientType, setRecipientType] = useState<RecipientType>(initialClient ? "client" : "custom")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId || null)
  const [customRecipient, setCustomRecipient] = useState<RecipientInfo>({
    fullName: "",
    companyName: "",
    email: "",
    address: "",
    city: "",
    country: "",
    vatNumber: "",
  })

  // Get selected client from clients list
  const selectedClient = useMemo(() => {
    if (recipientType === "client" && selectedClientId) {
      return clients.find((c) => c.id === selectedClientId) || initialClient || null
    }
    return null
  }, [recipientType, selectedClientId, clients, initialClient])

  const [invoiceNumber, setInvoiceNumber] = useState(`${settings.invoicePrefix}-${settings.invoiceStartNumber}`)
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
  const [notes, setNotes] = useState("")

  // Convert existing BillingLineItems to new InvoiceLineItem format
  const [items, setItems] = useState<InvoiceLineItem[]>(
    lineItems.map((item) => ({
      id: item.id,
      description: item.description,
      serviceId: null,
      quantity: 1,
      unitPrice: item.amountCents,
      taxRate: 0,
      total: item.amountCents,
    }))
  )
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Calculate totals from line items
  const subtotal = items.reduce((sum, i) => sum + i.total, 0)
  const totalTax = items.reduce((sum, i) => Math.round(i.total * (i.taxRate / 100)), 0)
  const total = subtotal + totalTax

  // Get average tax rate for display
  const avgTaxRate = items.length > 0
    ? items.reduce((sum, i) => sum + i.taxRate, 0) / items.length
    : 0

  // Get effective recipient info for preview
  const effectiveRecipientInfo: RecipientInfo | undefined = useMemo(() => {
    if (recipientType === "client" && selectedClient) {
      return {
        fullName: selectedClient.fullName,
        email: selectedClient.email,
      }
    }
    return customRecipient.fullName ? customRecipient : undefined
  }, [recipientType, selectedClient, customRecipient])

  // Convert InvoiceLineItems to BillingLineItems for the invoice
  const billingItems = useMemo(() =>
    items.map((item) => lineItemToBillingItem(item, selectedClientId, settings.currency, issueDate)),
    [items, selectedClientId, settings.currency, issueDate]
  )

  const invoice: Invoice = useMemo(() => ({
    id: `inv-${Date.now()}`,
    invoiceNumber,
    clientId: recipientType === "client" ? selectedClientId : null,
    recipientType,
    recipientInfo: effectiveRecipientInfo,
    lineItems: billingItems,
    subtotal,
    tax: totalTax || undefined,
    taxRate: avgTaxRate || undefined,
    total,
    status: "draft",
    issuedDate: issueDate,
    dueDate,
    notes: notes || undefined,
    createdAt: new Date().toISOString(),
  }), [invoiceNumber, selectedClientId, recipientType, effectiveRecipientInfo, billingItems, subtotal, totalTax, avgTaxRate, total, issueDate, dueDate, notes])

  const formatAmount = (cents: number) => `${settings.currency} ${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}`
  const inputClass = "w-full px-3 py-2 rounded bg-[#252538] border border-[var(--border)] text-sm text-[var(--text-primary)]"
  const labelClass = "block text-xs font-medium text-[var(--text-muted)] mb-1"

  // Line item handlers
  const updateLineItem = (id: string, updates: Partial<InvoiceLineItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, ...updates }
        // Recalculate total if price or quantity changed
        if (updates.unitPrice !== undefined || updates.quantity !== undefined) {
          updated.total = updated.unitPrice * updated.quantity
        }
        return updated
      })
    )
  }

  const removeLineItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: "",
        serviceId: null,
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        total: 0,
      },
    ])
  }

  const addLineItemFromService = (service: Service) => {
    const newItem: InvoiceLineItem = {
      id: crypto.randomUUID(),
      description: service.name,
      serviceId: service.id,
      quantity: 1,
      unitPrice: service.price,
      taxRate: 0,
      total: service.price,
    }
    setItems((prev) => [...prev, newItem])
  }

  const handleSaveInvoice = async (status: InvoiceStatus) => {
    // Validate recipient
    if (recipientType === "client" && !selectedClientId) {
      setSaveError("Please select a client")
      return
    }
    if (recipientType === "custom" && !customRecipient.fullName.trim()) {
      setSaveError("Recipient name is required")
      return
    }

    setIsSaving(true)
    setSaveError(null)

    const result = await createInvoice({
      clientId: recipientType === "client" ? selectedClientId : null,
      recipientType,
      recipientInfo: recipientType === "custom" ? customRecipient : undefined,
      lineItems: billingItems,
      invoiceNumber,
      taxRate: avgTaxRate || undefined,
      notes: notes || undefined,
      issuedDate: issueDate,
      dueDate,
      status,
    })

    if (result.success && result.invoice) {
      onSave(result.invoice)
      onClose()
    } else {
      setSaveError(result.error || "Failed to save invoice")
    }

    setIsSaving(false)
  }

  const handleSaveDraft = () => handleSaveInvoice("draft")
  const handleMarkSent = () => handleSaveInvoice("sent")
  const recipientName = recipientType === "client" && selectedClient ? selectedClient.fullName : customRecipient.fullName || "invoice"
  const handleDownloadPdf = () => { generateInvoicePdf("invoice-preview", `${invoiceNumber}-${recipientName.replace(/\s+/g, "-")}.pdf`) }

  if (showPreview) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setShowPreview(false)}>
        <div className="relative max-h-[90vh] overflow-auto bg-white rounded-lg" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"><X className="h-6 w-6" /></button>
          <InvoicePreview invoice={invoice} settings={settings} />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative flex w-full max-w-6xl mx-auto my-8 bg-[#0F1117] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Left Panel - Controls */}
        <div className="w-1/2 p-6 overflow-y-auto border-r border-[var(--border)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Create Invoice</h2>
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-4">
            {/* Recipient Toggle */}
            <div>
              <label className={labelClass}>Bill To</label>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setRecipientType("client")}
                  className={recipientType === "client" ? "flex-1 flex items-center justify-center gap-2 bg-[#2C5F2E] text-white px-4 py-2 rounded text-sm font-medium" : "flex-1 flex items-center justify-center gap-2 bg-[#252538] text-gray-300 px-4 py-2 rounded text-sm font-medium hover:bg-[#303050]"}
                >
                  <User className="h-4 w-4" />Existing Client
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType("custom")}
                  className={recipientType === "custom" ? "flex-1 flex items-center justify-center gap-2 bg-[#2C5F2E] text-white px-4 py-2 rounded text-sm font-medium" : "flex-1 flex items-center justify-center gap-2 bg-[#252538] text-gray-300 px-4 py-2 rounded text-sm font-medium hover:bg-[#303050]"}
                >
                  <Building2 className="h-4 w-4" />Custom Recipient
                </button>
              </div>

              {recipientType === "client" ? (
                <select
                  value={selectedClientId || ""}
                  onChange={(e) => setSelectedClientId(e.target.value || null)}
                  className={inputClass}
                >
                  <option value="">Select a client...</option>
                  {clients.filter((c) => c.isActive).map((c) => (
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              ) : (
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={customRecipient.fullName}
                      onChange={(e) => setCustomRecipient((prev) => ({ ...prev, fullName: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Company Name (optional)"
                      value={customRecipient.companyName || ""}
                      onChange={(e) => setCustomRecipient((prev) => ({ ...prev, companyName: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={customRecipient.email || ""}
                      onChange={(e) => setCustomRecipient((prev) => ({ ...prev, email: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Address (optional)"
                      value={customRecipient.address || ""}
                      onChange={(e) => setCustomRecipient((prev) => ({ ...prev, address: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City (optional)"
                      value={customRecipient.city || ""}
                      onChange={(e) => setCustomRecipient((prev) => ({ ...prev, city: e.target.value }))}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Country (optional)"
                      value={customRecipient.country || ""}
                      onChange={(e) => setCustomRecipient((prev) => ({ ...prev, country: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="VAT/Tax Number (optional)"
                      value={customRecipient.vatNumber || ""}
                      onChange={(e) => setCustomRecipient((prev) => ({ ...prev, vatNumber: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Invoice Number</label>
              <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Issue Date</label><input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Due Date</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} /></div>
            </div>
            {/* Line Items Section */}
            <div>
              <label className={labelClass}>Line Items</label>

              {/* Column Headers - Desktop */}
              <div className="hidden md:flex items-center gap-2 px-1 mb-2">
                <div className="flex-1 text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  Description / Service
                </div>
                <div className="w-16 text-xs text-[var(--text-muted)] uppercase tracking-wider text-center">
                  Qty
                </div>
                <div className="w-28 text-xs text-[var(--text-muted)] uppercase tracking-wider text-center">
                  Price
                </div>
                <div className="w-20 text-xs text-[var(--text-muted)] uppercase tracking-wider text-center">
                  Tax
                </div>
                <div className="w-24 text-xs text-[var(--text-muted)] uppercase tracking-wider text-right">
                  Total
                </div>
                <div className="w-8" />
              </div>

              {/* Line Items List */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id}>
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center gap-2 p-2 rounded bg-[#1A1A2E]">
                      {/* Service selector */}
                      <ServiceComboInput
                        value={item.description}
                        services={services}
                                                onSelect={(service) => {
                          updateLineItem(item.id, {
                            description: service.name,
                            serviceId: service.id,
                            unitPrice: service.price,
                            taxRate: 0,
                            total: service.price * item.quantity,
                          })
                        }}
                        onChange={(desc) => {
                          updateLineItem(item.id, {
                            description: desc,
                            serviceId: null,
                          })
                        }}
                      />

                      {/* Quantity */}
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const qty = parseFloat(e.target.value) || 1
                          updateLineItem(item.id, {
                            quantity: qty,
                            total: item.unitPrice * qty,
                          })
                        }}
                        className="w-16 bg-[#252538] border border-[var(--border)] rounded-lg px-2 py-2 text-[var(--text-primary)] text-sm text-center focus:border-[#2C5F2E] focus:outline-none"
                        placeholder="1"
                      />

                      {/* Unit price */}
                      <div className="relative w-28">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs">
                          {settings.currency}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={(item.unitPrice / 100).toFixed(2)}
                          onChange={(e) => {
                            const price = Math.round(parseFloat(e.target.value) * 100) || 0
                            updateLineItem(item.id, {
                              unitPrice: price,
                              total: price * item.quantity,
                            })
                          }}
                          className="w-full bg-[#252538] border border-[var(--border)] rounded-lg pl-8 pr-2 py-2 text-[var(--text-primary)] text-sm text-right focus:border-[#2C5F2E] focus:outline-none"
                        />
                      </div>

                      {/* Tax rate */}
                      <div className="relative w-20">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.taxRate}
                          onChange={(e) => {
                            updateLineItem(item.id, {
                              taxRate: parseFloat(e.target.value) || 0,
                            })
                          }}
                          className="w-full bg-[#252538] border border-[var(--border)] rounded-lg px-2 py-2 text-[var(--text-primary)] text-sm text-center focus:border-[#2C5F2E] focus:outline-none"
                          placeholder="0"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs">
                          %
                        </span>
                      </div>

                      {/* Line total (calculated) */}
                      <div className="w-24 text-right text-[var(--text-primary)] text-sm font-medium">
                        {formatAmount(item.total)}
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-1 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden p-3 rounded bg-[#1A1A2E] space-y-3">
                      <ServiceComboInput
                        value={item.description}
                        services={services}
                                                onSelect={(service) => {
                          updateLineItem(item.id, {
                            description: service.name,
                            serviceId: service.id,
                            unitPrice: service.price,
                            taxRate: 0,
                            total: service.price * item.quantity,
                          })
                        }}
                        onChange={(desc) => {
                          updateLineItem(item.id, {
                            description: desc,
                            serviceId: null,
                          })
                        }}
                      />

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-[var(--text-muted)]">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = parseFloat(e.target.value) || 1
                              updateLineItem(item.id, {
                                quantity: qty,
                                total: item.unitPrice * qty,
                              })
                            }}
                            className="w-full bg-[#252538] border border-[var(--border)] rounded-lg px-2 py-2 text-[var(--text-primary)] text-sm text-center focus:border-[#2C5F2E] focus:outline-none"
                          />
                        </div>

                        <div className="flex-1">
                          <label className="text-xs text-[var(--text-muted)]">Price</label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs">
                              {settings.currency}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={(item.unitPrice / 100).toFixed(2)}
                              onChange={(e) => {
                                const price = Math.round(parseFloat(e.target.value) * 100) || 0
                                updateLineItem(item.id, {
                                  unitPrice: price,
                                  total: price * item.quantity,
                                })
                              }}
                              className="w-full bg-[#252538] border border-[var(--border)] rounded-lg pl-8 pr-2 py-2 text-[var(--text-primary)] text-sm text-right focus:border-[#2C5F2E] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="w-16">
                          <label className="text-xs text-[var(--text-muted)]">Tax %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.taxRate}
                            onChange={(e) => {
                              updateLineItem(item.id, {
                                taxRate: parseFloat(e.target.value) || 0,
                              })
                            }}
                            className="w-full bg-[#252538] border border-[var(--border)] rounded-lg px-2 py-2 text-[var(--text-primary)] text-sm text-center focus:border-[#2C5F2E] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          Total: {formatAmount(item.total)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Add Buttons */}
              {services.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3 mb-3">
                  <span className="text-xs text-[var(--text-muted)]">Quick add:</span>
                  {services.slice(0, 4).map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => addLineItemFromService(service)}
                      className="text-xs bg-[#252538] hover:bg-[#303050] border border-[var(--border)] hover:border-[#2C5F2E] text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-full transition-colors"
                    >
                      {service.name}
                    </button>
                  ))}
                </div>
              )}

              <button onClick={handleAddItem} className="mt-2 flex items-center gap-1 text-sm text-[#2C5F2E] hover:text-green-400">
                <Plus className="h-4 w-4" />Add Line Item
              </button>
            </div>
            <div><label className={labelClass}>Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} placeholder="Additional notes..." /></div>
            <div className="p-4 rounded bg-[#1A1A2E]">
              <div className="flex justify-between text-sm mb-1"><span className="text-[var(--text-muted)]">Subtotal</span><span>{formatAmount(subtotal)}</span></div>
              {totalTax > 0 && <div className="flex justify-between text-sm mb-1"><span className="text-[var(--text-muted)]">Tax</span><span>{formatAmount(totalTax)}</span></div>}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--border)]"><span>Total</span><span>{formatAmount(total)}</span></div>
            </div>
          </div>
          {saveError && (
            <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {saveError}
            </div>
          )}
          <div className="flex gap-2 mt-6">
            <button onClick={handleSaveDraft} disabled={isSaving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium bg-[#1A1A2E] text-[var(--text-primary)] hover:bg-[#252538] disabled:opacity-50"><Save className="h-4 w-4" />{isSaving ? "Saving..." : "Save Draft"}</button>
            <button onClick={() => setShowPreview(true)} className="flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium bg-blue-900/30 text-blue-400 hover:bg-blue-900/50"><Eye className="h-4 w-4" />Preview</button>
            <button onClick={handleDownloadPdf} className="flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"><Download className="h-4 w-4" />PDF</button>
            <button onClick={handleMarkSent} disabled={isSaving} className="flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: "#2C5F2E" }}><Send className="h-4 w-4" />{isSaving ? "Saving..." : "Send"}</button>
          </div>
        </div>
        {/* Right Panel - Live Preview */}
        <div className="w-1/2 p-4 overflow-y-auto bg-gray-100"><div className="transform scale-[0.6] origin-top"><InvoicePreview invoice={invoice} settings={settings} /></div></div>
      </div>
    </div>
  )
}
