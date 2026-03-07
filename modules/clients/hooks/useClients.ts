/**
 * FILE: modules/clients/hooks/useClients.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch all active clients from Supabase
 * EXPORTS: useClients
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: modules/clients/components/*, app/clients/*
 * TESTS: modules/clients/tests/useClients.test.ts
 * LAST CHANGED: 2026-03-07 — V2: Wired to Supabase with stable_id filter
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { Client } from "@/lib/types"

// DB row type from Supabase
interface ClientRow {
  id: string
  stable_id: string | null
  full_name: string
  email: string
  phone: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  gdpr_consent_at: string | null
  gdpr_consent_version: string | null
  photo_url: string | null
  notes: string | null
  is_active: boolean | null
  created_at: string | null
}

interface UseClientsReturn {
  clients: Client[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useClients(): UseClientsReturn {
  const { currentUser } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // If logged in but no stableId, show empty state (not mock data)
    if (currentUser && !currentUser.stableId) {
      console.warn("useClients: User logged in but stableId is missing - showing empty state")
      setClients([])
      setIsLoading(false)
      return
    }

    // Not logged in yet
    if (!currentUser?.stableId) {
      setIsLoading(false)
      return
    }

    async function fetchClients() {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("clients")
        .select("*")
        .eq("stable_id", currentUser!.stableId)
        .eq("is_active", true)
        .order("full_name")

      if (fetchError) {
        console.error("Failed to fetch clients:", fetchError)
        setError(fetchError.message)
        setClients([])
      } else {
        // Map snake_case DB columns to camelCase types
        const mapped: Client[] = (data || []).map((row: ClientRow) => ({
          id: row.id,
          fullName: row.full_name,
          email: row.email,
          phone: row.phone || "",
          emergencyContactName: row.emergency_contact_name || "",
          emergencyContactPhone: row.emergency_contact_phone || "",
          gdprConsentAt: row.gdpr_consent_at,
          gdprConsentVersion: row.gdpr_consent_version,
          notes: row.notes || "",
          photoUrl: row.photo_url ?? undefined,
          isActive: row.is_active ?? true,
          createdAt: row.created_at || "",
        }))
        setClients(mapped)
      }

      setIsLoading(false)
    }

    fetchClients()
  }, [currentUser?.stableId, supabase, refetchTrigger])

  const refetch = () => setRefetchTrigger((n) => n + 1)

  return { clients, isLoading, error, refetch }
}
