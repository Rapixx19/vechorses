/**
 * FILE: modules/horses/hooks/useHorses.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch all active horses from Supabase
 * EXPORTS: useHorses
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: modules/horses/components/*, app/horses/*
 * TESTS: modules/horses/tests/useHorses.test.ts
 * LAST CHANGED: 2026-03-07 — V2: Wired to Supabase with stable_id filter
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { Horse } from "@/lib/types"

// DB row type from Supabase
interface HorseRow {
  id: string
  stable_id: string | null
  name: string
  breed: string | null
  color: string | null
  date_of_birth: string | null
  stall_id: string | null
  owner_id: string | null
  medical_notes: string | null
  feeding_notes: string | null
  photo_url: string | null
  photo_urls: string[] | null
  is_active: boolean | null
  created_at: string | null
}

interface UseHorsesReturn {
  horses: Horse[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useHorses(): UseHorsesReturn {
  const { currentUser } = useAuth()
  const [horses, setHorses] = useState<Horse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!currentUser?.stableId) {
      setIsLoading(false)
      return
    }

    async function fetchHorses() {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("horses")
        .select("*")
        .eq("stable_id", currentUser!.stableId)
        .eq("is_active", true)
        .order("name")

      if (fetchError) {
        console.error("Failed to fetch horses:", fetchError)
        setError(fetchError.message)
        setHorses([])
      } else {
        // Map snake_case DB columns to camelCase types
        const mapped: Horse[] = (data || []).map((row: HorseRow) => ({
          id: row.id,
          name: row.name,
          breed: row.breed || "",
          dateOfBirth: row.date_of_birth || "",
          color: row.color || "",
          stallId: row.stall_id,
          ownerId: row.owner_id || "",
          medicalNotes: row.medical_notes || "",
          feedingNotes: row.feeding_notes || "",
          photoUrl: row.photo_url,
          photoUrls: row.photo_urls || [],
          isActive: row.is_active ?? true,
          createdAt: row.created_at || "",
        }))
        setHorses(mapped)
      }

      setIsLoading(false)
    }

    fetchHorses()
  }, [currentUser?.stableId, supabase, refetchTrigger])

  const refetch = () => setRefetchTrigger((n) => n + 1)

  return { horses, isLoading, error, refetch }
}
