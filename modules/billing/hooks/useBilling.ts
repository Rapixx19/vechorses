/**
 * FILE: modules/billing/hooks/useBilling.ts
 * ZONE: Red
 * PURPOSE: Hook to fetch billing line items from Supabase (read-only)
 * EXPORTS: useBilling
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: modules/billing/components/*, modules/dashboard/*, app/billing/*
 * TESTS: modules/billing/tests/useBilling.test.ts
 * LAST CHANGED: 2026-03-07 — V2: Wired to Supabase billing_line_items table
 */

// 🔴 RED ZONE — do not edit without human approval
// Billing data is written by external freelancer, we only read

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { BillingLineItem, BillingStatus, ServiceType } from "@/lib/types"

// DB row type from Supabase
interface BillingLineItemRow {
  id: string
  stable_id: string | null
  client_id: string | null
  service_id: string | null
  service_type: string
  description: string
  amount_cents: number
  currency: string | null
  status: string | null
  service_date: string | null
  notes: string | null
  created_at: string | null
}

interface UseBillingReturn {
  items: BillingLineItem[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

// BREADCRUMB: Freelancer writes to billing_line_items table, we only read.
// Never modify billing schema without telling freelancer.
export function useBilling(): UseBillingReturn {
  const { currentUser } = useAuth()
  const [items, setItems] = useState<BillingLineItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!currentUser?.stableId) {
      setItems([])
      setIsLoading(false)
      return
    }

    async function fetchBillingItems() {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("billing_line_items")
        .select("*")
        .eq("stable_id", currentUser!.stableId)
        .order("service_date", { ascending: false })

      if (fetchError) {
        console.error("Failed to fetch billing items:", fetchError)
        setError(fetchError.message)
        setItems([])
      } else {
        const mapped: BillingLineItem[] = (data || []).map((row: BillingLineItemRow) => ({
          id: row.id,
          clientId: row.client_id || "",
          serviceType: (row.service_type as ServiceType) || "other",
          description: row.description,
          amountCents: row.amount_cents,
          currency: row.currency || "EUR",
          status: (row.status as BillingStatus) || "pending",
          serviceDate: row.service_date || "",
          createdAt: row.created_at || new Date().toISOString(),
        }))
        setItems(mapped)
      }

      setIsLoading(false)
    }

    fetchBillingItems()
  }, [currentUser?.stableId, supabase, refetchTrigger])

  const refetch = useCallback(() => setRefetchTrigger((n) => n + 1), [])

  return { items, isLoading, error, refetch }
}
