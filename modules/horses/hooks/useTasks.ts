/**
 * FILE: modules/horses/hooks/useTasks.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch tasks, optionally filtered by horseId
 * EXPORTS: useTasks
 * DEPENDS ON: lib/mock-data.ts, lib/types.ts
 * CONSUMED BY: modules/horses/components/*, modules/dashboard/*, app/horses/*
 * TESTS: modules/horses/tests/useTasks.test.ts
 * LAST CHANGED: 2026-03-05 — Initial creation with mock data
 */

import { mockTasks } from "@/lib/mock"
import type { Task } from "@/lib/types"

// BREADCRUMB: V1 returns mock data. V2 will swap internals to Supabase query.
// If horseId provided: return tasks for that horse only
// If no horseId: return all tasks
export function useTasks(horseId?: string): Task[] {
  if (horseId) {
    return mockTasks.filter((task) => task.horseId === horseId)
  }
  return mockTasks
}
