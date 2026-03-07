/**
 * FILE: modules/stalls/hooks/useStableLayout.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch and save stable layout from/to Supabase
 * EXPORTS: useStableLayout
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: modules/stalls/components/FloorPlanCanvas
 * TESTS: modules/stalls/tests/useStableLayout.test.ts
 * LAST CHANGED: 2026-03-07 — Initial creation for floor plan builder
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { StableLayout, LayoutCell, Stall } from "@/lib/types"

interface UseStableLayoutReturn {
  layout: StableLayout | null
  isLoading: boolean
  error: string | null
  saveLayout: (layout: StableLayout) => Promise<boolean>
  generateDefaultLayout: (stalls: Stall[], cols?: number) => StableLayout
}

// BREADCRUMB: Default grid dimensions
const DEFAULT_ROWS = 8
const DEFAULT_COLS = 10

export function useStableLayout(): UseStableLayoutReturn {
  const { currentUser } = useAuth()
  const [layout, setLayout] = useState<StableLayout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // BREADCRUMB: Fetch layout from stables table
  useEffect(() => {
    if (!currentUser?.stableId) {
      setIsLoading(false)
      return
    }

    async function fetchLayout() {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("stables")
        .select("stable_layout")
        .eq("id", currentUser!.stableId)
        .single()

      if (fetchError) {
        console.error("Failed to fetch stable layout:", fetchError)
        setError(fetchError.message)
        setLayout(null)
      } else {
        setLayout(data?.stable_layout as StableLayout | null)
      }

      setIsLoading(false)
    }

    fetchLayout()
  }, [currentUser?.stableId, supabase])

  // BREADCRUMB: Save layout to stables table
  const saveLayout = useCallback(
    async (newLayout: StableLayout): Promise<boolean> => {
      if (!currentUser?.stableId) {
        console.error("saveLayout: no stableId")
        return false
      }

      const { error: updateError } = await supabase
        .from("stables")
        .update({ stable_layout: newLayout })
        .eq("id", currentUser.stableId)

      if (updateError) {
        console.error("saveLayout error:", updateError)
        return false
      }

      setLayout(newLayout)
      return true
    },
    [currentUser?.stableId, supabase]
  )

  // BREADCRUMB: Auto-arrange stalls in rows when no layout exists
  const generateDefaultLayout = useCallback(
    (stalls: Stall[], cols: number = DEFAULT_COLS): StableLayout => {
      const cells: LayoutCell[] = []
      const rows = Math.max(DEFAULT_ROWS, Math.ceil(stalls.length / cols) + 2)

      stalls.forEach((stall, index) => {
        const row = Math.floor(index / cols)
        const col = index % cols
        cells.push({
          row,
          col,
          type: "stall",
          stallId: stall.id,
          stallType: stall.type,
          label: stall.label,
          width: 1,
          height: 1,
        })
      })

      return { rows, cols, cells }
    },
    []
  )

  return { layout, isLoading, error, saveLayout, generateDefaultLayout }
}
