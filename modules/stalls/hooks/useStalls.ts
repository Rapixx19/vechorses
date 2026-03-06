/**
 * FILE: modules/stalls/hooks/useStalls.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch all stalls from Supabase
 * EXPORTS: useStalls
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: modules/stalls/components/*, app/stalls/*
 * TESTS: modules/stalls/tests/useStalls.test.ts
 * LAST CHANGED: 2026-03-07 — V2: Wired to Supabase with stable_id filter
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { Stall } from "@/lib/types"

interface UseStallsReturn {
  stalls: Stall[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

// DB row type from Supabase
interface StallRow {
  id: string
  stable_id: string | null
  label: string
  notes: string | null
  created_at: string | null
}

export function useStalls(): UseStallsReturn {
  const { currentUser } = useAuth()
  const [stalls, setStalls] = useState<Stall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!currentUser?.stableId) {
      setIsLoading(false)
      return
    }

    async function fetchStalls() {
      setIsLoading(true)
      setError(null)

      // Fetch stalls with their assigned horse (if any)
      const { data, error: fetchError } = await supabase
        .from("stalls")
        .select("*, horses!horses_stall_id_fkey(id)")
        .eq("stable_id", currentUser!.stableId)
        .order("label")

      if (fetchError) {
        console.error("Failed to fetch stalls:", fetchError)
        setError(fetchError.message)
        setStalls([])
      } else {
        // Map snake_case DB columns to camelCase types
        const mapped: Stall[] = (data || []).map((row: StallRow & { horses?: { id: string }[] }) => ({
          id: row.id,
          label: row.label,
          horseId: row.horses?.[0]?.id || null,
          notes: row.notes || "",
        }))
        setStalls(mapped)
      }

      setIsLoading(false)
    }

    fetchStalls()
  }, [currentUser?.stableId, supabase, refetchTrigger])

  const refetch = () => setRefetchTrigger((n) => n + 1)

  return { stalls, isLoading, error, refetch }
}
