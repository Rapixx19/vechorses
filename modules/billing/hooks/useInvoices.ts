/**
 * FILE: modules/billing/hooks/useInvoices.ts
 * ZONE: 🔴 Red
 * PURPOSE: Hook for invoice state management and creation from Supabase
 * EXPORTS: useInvoices, useCreateInvoice, useUpdateInvoice
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: InvoiceBuilder, app/settings/page.tsx, app/billing/page.tsx
 * TESTS: modules/billing/tests/useInvoices.test.ts
 * LAST CHANGED: 2026-03-07 — V2: Wired to Supabase invoices table
 */

// 🔴 RED ZONE — billing invoices, handle with care

"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { Invoice, BillingLineItem, InvoiceStatus, RecipientType, RecipientInfo } from "@/lib/types"

// DB row type from Supabase
interface InvoiceRow {
  id: string
  stable_id: string | null
  client_id: string | null
  invoice_number: string
  line_items: BillingLineItem[]
  subtotal: number
  tax: number | null
  tax_rate: number | null
  total: number
  status: string | null
  issued_date: string | null
  due_date: string | null
  paid_date: string | null
  notes: string | null
  recipient_type: string | null
  recipient_info: RecipientInfo | null
  created_at: string | null
}

interface UseInvoicesReturn {
  invoices: Invoice[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useInvoices(): UseInvoicesReturn {
  const { currentUser } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!currentUser?.stableId) {
      setInvoices([])
      setIsLoading(false)
      return
    }

    async function fetchInvoices() {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("invoices")
        .select("*")
        .eq("stable_id", currentUser!.stableId)
        .order("created_at", { ascending: false })

      if (fetchError) {
        console.error("Failed to fetch invoices:", fetchError)
        setError(fetchError.message)
        setInvoices([])
      } else {
        const mapped: Invoice[] = (data || []).map((row: InvoiceRow) => ({
          id: row.id,
          invoiceNumber: row.invoice_number,
          clientId: row.client_id || null,
          recipientType: (row.recipient_type as RecipientType) || "client",
          recipientInfo: row.recipient_info || undefined,
          lineItems: row.line_items || [],
          subtotal: row.subtotal,
          tax: row.tax || undefined,
          taxRate: row.tax_rate || undefined,
          total: row.total,
          status: (row.status as InvoiceStatus) || "draft",
          issuedDate: row.issued_date || "",
          dueDate: row.due_date || "",
          paidDate: row.paid_date || undefined,
          notes: row.notes || undefined,
          createdAt: row.created_at || new Date().toISOString(),
        }))
        setInvoices(mapped)
      }

      setIsLoading(false)
    }

    fetchInvoices()
  }, [currentUser?.stableId, supabase, refetchTrigger])

  const refetch = useCallback(() => setRefetchTrigger((n) => n + 1), [])

  return { invoices, isLoading, error, refetch }
}

interface CreateInvoiceInput {
  clientId: string | null
  recipientType: RecipientType
  recipientInfo?: RecipientInfo
  lineItems: BillingLineItem[]
  invoiceNumber: string
  taxRate?: number
  notes?: string
  issuedDate?: string
  dueDate?: string
  status?: InvoiceStatus
}

export function useCreateInvoice(): {
  createInvoice: (input: CreateInvoiceInput) => Promise<{ success: boolean; invoice?: Invoice; error?: string }>
} {
  const { currentUser } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const createInvoice = useCallback(
    async (input: CreateInvoiceInput) => {
      if (!currentUser?.stableId) {
        return { success: false, error: "No stable ID found" }
      }

      const subtotal = input.lineItems.reduce((sum, item) => sum + item.amountCents, 0)
      const tax = input.taxRate && input.taxRate > 0 ? Math.round(subtotal * (input.taxRate / 100)) : 0
      const total = subtotal + tax

      const { data, error } = await supabase
        .from("invoices")
        .insert({
          stable_id: currentUser.stableId,
          client_id: input.clientId,
          recipient_type: input.recipientType,
          recipient_info: input.recipientInfo || null,
          invoice_number: input.invoiceNumber,
          line_items: input.lineItems,
          subtotal,
          tax: tax || null,
          tax_rate: input.taxRate || null,
          total,
          status: input.status || "draft",
          issued_date: input.issuedDate || new Date().toISOString().split("T")[0],
          due_date: input.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          notes: input.notes || null,
        })
        .select()
        .single()

      if (error) {
        console.error("Failed to create invoice:", error)
        return { success: false, error: error.message }
      }

      const row = data as InvoiceRow
      const invoice: Invoice = {
        id: row.id,
        invoiceNumber: row.invoice_number,
        clientId: row.client_id || null,
        recipientType: (row.recipient_type as RecipientType) || "client",
        recipientInfo: row.recipient_info || undefined,
        lineItems: row.line_items || [],
        subtotal: row.subtotal,
        tax: row.tax || undefined,
        taxRate: row.tax_rate || undefined,
        total: row.total,
        status: (row.status as InvoiceStatus) || "draft",
        issuedDate: row.issued_date || "",
        dueDate: row.due_date || "",
        notes: row.notes || undefined,
        createdAt: row.created_at || new Date().toISOString(),
      }

      return { success: true, invoice }
    },
    [currentUser?.stableId, supabase]
  )

  return { createInvoice }
}

export function useUpdateInvoice(): {
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => Promise<{ success: boolean; error?: string }>
} {
  const { currentUser } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const updateInvoice = useCallback(
    async (invoiceId: string, updates: Partial<Invoice>) => {
      if (!currentUser?.stableId) {
        return { success: false, error: "No stable ID found" }
      }

      // Map camelCase to snake_case
      const dbUpdates: Record<string, unknown> = {}
      if (updates.invoiceNumber !== undefined) dbUpdates.invoice_number = updates.invoiceNumber
      if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId
      if (updates.lineItems !== undefined) dbUpdates.line_items = updates.lineItems
      if (updates.subtotal !== undefined) dbUpdates.subtotal = updates.subtotal
      if (updates.tax !== undefined) dbUpdates.tax = updates.tax
      if (updates.taxRate !== undefined) dbUpdates.tax_rate = updates.taxRate
      if (updates.total !== undefined) dbUpdates.total = updates.total
      if (updates.status !== undefined) dbUpdates.status = updates.status
      if (updates.issuedDate !== undefined) dbUpdates.issued_date = updates.issuedDate
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate
      if (updates.paidDate !== undefined) dbUpdates.paid_date = updates.paidDate
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes

      const { error } = await supabase
        .from("invoices")
        .update(dbUpdates)
        .eq("id", invoiceId)
        .eq("stable_id", currentUser.stableId)

      if (error) {
        console.error("Failed to update invoice:", error)
        return { success: false, error: error.message }
      }

      return { success: true }
    },
    [currentUser?.stableId, supabase]
  )

  return { updateInvoice }
}
