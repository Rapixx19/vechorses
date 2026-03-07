/**
 * FILE: modules/stalls/hooks/useStalls.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch, add, update, delete stalls from Supabase
 * EXPORTS: useStalls, useAddStall, useUpdateStall, useDeleteStall
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: modules/stalls/components/*, app/stalls/*
 * TESTS: modules/stalls/tests/useStalls.test.ts
 * LAST CHANGED: 2026-03-07 — Added position columns and update/delete hooks
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
  position: number | null
  row_index: number | null
  col_index: number | null
  grid_cols: number | null
  is_maintenance: boolean | null
  created_at: string | null
}

// Input type for adding a stall
export interface AddStallInput {
  label: string
  type?: StallType
  notes?: string
  position?: number
  rowIndex?: number
  colIndex?: number
}

// BREADCRUMB: Map DB row to frontend Stall type
function mapRowToStall(row: StallRow & { horses?: { id: string }[] }): Stall {
  return {
    id: row.id,
    label: row.label,
    type: (row.type as StallType) || "standard",
    horseId: row.horses?.[0]?.id || null,
    notes: row.notes || "",
    position: row.position || 0,
    rowIndex: row.row_index || 0,
    colIndex: row.col_index || 0,
    gridCols: row.grid_cols || 4,
    isMaintenance: row.is_maintenance || false,
  }
}

export function useStalls(): UseStallsReturn {
  const { currentUser } = useAuth()
  const [stalls, setStalls] = useState<Stall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (currentUser && !currentUser.stableId) {
      console.warn("useStalls: User logged in but stableId is missing")
      setStalls([])
      setIsLoading(false)
      return
    }

    if (!currentUser?.stableId) {
      setIsLoading(false)
      return
    }

    async function fetchStalls() {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("stalls")
        .select("*, horses!horses_stall_id_fkey(id)")
        .eq("stable_id", currentUser!.stableId)
        .order("position", { ascending: true })

      if (fetchError) {
        console.error("Failed to fetch stalls:", fetchError)
        setError(fetchError.message)
        setStalls([])
      } else {
        const mapped = (data || []).map(mapRowToStall)
        setStalls(mapped)
      }

      setIsLoading(false)
    }

    fetchStalls()
  }, [currentUser?.stableId, supabase, refetchTrigger])

  const refetch = useCallback(() => setRefetchTrigger((n) => n + 1), [])

  return { stalls, isLoading, error, refetch }
}

export function useAddStall() {
  const { currentUser } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const addStall = async (stall: AddStallInput): Promise<{ success: boolean; error?: string; id?: string }> => {
    if (!currentUser?.stableId) {
      console.error("addStall: no stableId")
      return { success: false, error: "No stable ID found" }
    }

    const { data, error } = await supabase
      .from("stalls")
      .insert({
        stable_id: currentUser.stableId,
        label: stall.label,
        type: stall.type || "standard",
        notes: stall.notes || null,
        position: stall.position ?? 0,
        row_index: stall.rowIndex ?? 0,
        col_index: stall.colIndex ?? 0,
      })
      .select("id")
      .single()

    if (error) {
      console.error("addStall error:", JSON.stringify(error))
      return { success: false, error: error.message }
    }

    return { success: true, id: data.id }
  }

  return { addStall }
}

export function useUpdateStall() {
  const supabase = useMemo(() => createClient(), [])

  const updateStall = useCallback(
    async (id: string, updates: Partial<Stall>): Promise<boolean> => {
      const dbUpdates: Record<string, unknown> = {}
      if (updates.label !== undefined) dbUpdates.label = updates.label
      if (updates.type !== undefined) dbUpdates.type = updates.type
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null
      if (updates.position !== undefined) dbUpdates.position = updates.position
      if (updates.rowIndex !== undefined) dbUpdates.row_index = updates.rowIndex
      if (updates.colIndex !== undefined) dbUpdates.col_index = updates.colIndex
      if (updates.gridCols !== undefined) dbUpdates.grid_cols = updates.gridCols
      if (updates.isMaintenance !== undefined) dbUpdates.is_maintenance = updates.isMaintenance

      const { error } = await supabase.from("stalls").update(dbUpdates).eq("id", id)

      if (error) {
        console.error("updateStall error:", JSON.stringify(error))
        return false
      }

      return true
    },
    [supabase]
  )

  // BREADCRUMB: Batch update for reordering stalls
  const updateStallPositions = useCallback(
    async (updates: { id: string; position: number; rowIndex: number; colIndex: number }[]): Promise<boolean> => {
      for (const update of updates) {
        const { error } = await supabase
          .from("stalls")
          .update({ position: update.position, row_index: update.rowIndex, col_index: update.colIndex })
          .eq("id", update.id)

        if (error) {
          console.error("updateStallPositions error:", JSON.stringify(error))
          return false
        }
      }
      return true
    },
    [supabase]
  )

  return { updateStall, updateStallPositions }
}

export function useDeleteStall() {
  const supabase = useMemo(() => createClient(), [])

  const deleteStall = useCallback(
    async (id: string): Promise<boolean> => {
      const { error } = await supabase.from("stalls").delete().eq("id", id)

      if (error) {
        console.error("deleteStall error:", JSON.stringify(error))
        return false
      }

      return true
    },
    [supabase]
  )

  return { deleteStall }
}
