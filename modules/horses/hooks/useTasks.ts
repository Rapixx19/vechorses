/**
 * FILE: modules/horses/hooks/useTasks.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch tasks from Supabase, optionally filtered by horseId
 * EXPORTS: useTasks
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: modules/horses/components/*, modules/dashboard/*, app/horses/*
 * TESTS: modules/horses/tests/useTasks.test.ts
 * LAST CHANGED: 2026-03-07 — V2: Wired to Supabase with stable_id filter
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { Task, TaskType } from "@/lib/types"

interface UseTasksReturn {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

// DB row type from Supabase
interface TaskRow {
  id: string
  stable_id: string | null
  horse_id: string | null
  type: string
  title: string
  notes: string | null
  due_date: string | null
  completed_at: string | null
  created_at: string | null
}

// If horseId provided: return tasks for that horse only
// If no horseId: return all tasks for the stable
export function useTasks(horseId?: string): UseTasksReturn {
  const { currentUser } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!currentUser?.stableId) {
      setIsLoading(false)
      return
    }

    async function fetchTasks() {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from("tasks")
        .select("*")
        .eq("stable_id", currentUser!.stableId)
        .order("due_date", { ascending: true })

      if (horseId) {
        query = query.eq("horse_id", horseId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error("Failed to fetch tasks:", fetchError)
        setError(fetchError.message)
        setTasks([])
      } else {
        // Map snake_case DB columns to camelCase types
        const mapped: Task[] = (data || []).map((row: TaskRow) => ({
          id: row.id,
          horseId: row.horse_id || "",
          type: row.type as TaskType,
          title: row.title,
          notes: row.notes || "",
          dueDate: row.due_date || "",
          completedAt: row.completed_at,
          createdAt: row.created_at || "",
        }))
        setTasks(mapped)
      }

      setIsLoading(false)
    }

    fetchTasks()
  }, [currentUser?.stableId, horseId, supabase, refetchTrigger])

  const refetch = () => setRefetchTrigger((n) => n + 1)

  return { tasks, isLoading, error, refetch }
}
