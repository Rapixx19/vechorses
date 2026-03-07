/**
 * FILE: modules/stalls/hooks/useStalls.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch all stalls from Supabase and add new stalls
 * EXPORTS: useStalls, useAddStall
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: modules/stalls/components/*, app/stalls/*
 * TESTS: modules/stalls/tests/useStalls.test.ts
 * LAST CHANGED: 2026-03-07 — Added useAddStall hook and type column support
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { Stall, StallType } from "@/lib/types"

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
  type: string | null
  notes: string | null
  created_at: string | null
}

// Input type for adding a stall
export interface AddStallInput {
  label: string
  type?: string
  notes?: string
}

export function useStalls(): UseStallsReturn {
  const { currentUser } = useAuth()
  const [stalls, setStalls] = useState<Stall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // If logged in but no stableId, show empty state (not mock data)
    if (currentUser && !currentUser.stableId) {
      console.warn("useStalls: User logged in but stableId is missing - showing empty state")
      setStalls([])
      setIsLoading(false)
      return
    }

    // Not logged in yet
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
          type: (row.type as StallType) || "standard",
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

export function useAddStall() {
  const { currentUser } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const addStall = async (stall: AddStallInput): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser?.stableId) {
      console.error("addStall: no stableId")
      return { success: false, error: "No stable ID found" }
    }

    const { error } = await supabase.from("stalls").insert({
      stable_id: currentUser.stableId,
      label: stall.label,
      type: stall.type || "standard",
      notes: stall.notes || null,
    })

    if (error) {
      console.error("addStall error:", JSON.stringify(error))
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  return { addStall }
}
