/**
 * FILE: modules/billing/hooks/useInvoices.ts
 * ZONE: 🔴 Red
 * PURPOSE: Hook for invoice state management and creation
 * EXPORTS: useInvoices, useCreateInvoice
 * DEPENDS ON: lib/mock/invoices, lib/types
 * CONSUMED BY: InvoiceBuilder, app/settings/page.tsx
 * TESTS: modules/billing/tests/useInvoices.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation for Phase 7b
 */

// 🔴 RED ZONE — billing invoices, handle with care

"use client"

import { useState, useCallback, useEffect } from "react"
import { mockInvoices, mockStableSettings } from "@/lib/mock"
import type { Invoice, BillingLineItem } from "@/lib/types"

// Shared state across hook instances (V1 mock approach)
let globalInvoices: Invoice[] = [...mockInvoices]
let nextInvoiceNumber = mockStableSettings.invoiceStartNumber + mockInvoices.length
const listeners: Set<() => void> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function useInvoices(): Invoice[] {
  const [, forceUpdate] = useState({})

  useEffect(() => {
    const listener = () => forceUpdate({})
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return globalInvoices
}

export function useCreateInvoice(): (clientId: string, lineItems: BillingLineItem[], taxRate?: number, notes?: string) => Invoice {
  return useCallback((clientId: string, lineItems: BillingLineItem[], taxRate = 0, notes?: string) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amountCents, 0)
    const tax = taxRate > 0 ? Math.round(subtotal * (taxRate / 100)) : undefined
    const total = subtotal + (tax || 0)

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `${mockStableSettings.invoicePrefix}-${nextInvoiceNumber}`,
      clientId,
      lineItems,
      subtotal,
      tax,
      taxRate: taxRate > 0 ? taxRate : undefined,
      total,
      status: "draft",
      issuedDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes,
      createdAt: new Date().toISOString(),
    }

    globalInvoices = [invoice, ...globalInvoices]
    nextInvoiceNumber++
    notifyListeners()
    return invoice
  }, [])
}

export function useUpdateInvoice(): (invoiceId: string, updates: Partial<Invoice>) => void {
  return useCallback((invoiceId: string, updates: Partial<Invoice>) => {
    globalInvoices = globalInvoices.map((inv) => (inv.id === invoiceId ? { ...inv, ...updates } : inv))
    notifyListeners()
  }, [])
}
