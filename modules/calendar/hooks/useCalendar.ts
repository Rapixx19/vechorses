/**
 * FILE: modules/calendar/hooks/useCalendar.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch and manage calendar events from Supabase
 * EXPORTS: useCalendar, useAddEvent, useUpdateEvent, useDeleteEvent
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: modules/calendar/components/*
 * TESTS: modules/calendar/tests/useCalendar.test.ts
 * LAST CHANGED: 2026-03-07 — Initial creation for calendar page
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { CalendarEvent, EventCategory } from "@/lib/types"

// BREADCRUMB: DB row type from Supabase
interface EventRow {
  id: string
  stable_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  all_day: boolean
  category: string
  color: string
  location: string | null
  horse_id: string | null
  assigned_to: string[] | null
  created_by: string | null
  is_recurring: boolean
  recurrence_rule: string | null
  external_id: string | null
  external_source: string | null
  created_at: string
  horses?: { name: string } | null
}

// BREADCRUMB: Map DB row to CalendarEvent
function mapRowToEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    stableId: row.stable_id,
    title: row.title,
    description: row.description || undefined,
    startTime: row.start_time,
    endTime: row.end_time,
    allDay: row.all_day,
    category: (row.category as EventCategory) || "general",
    color: row.color || "#2C5F2E",
    location: row.location || undefined,
    horseId: row.horse_id || undefined,
    horseName: row.horses?.name,
    assignedTo: row.assigned_to || [],
    createdBy: row.created_by || undefined,
    isRecurring: row.is_recurring,
    recurrenceRule: row.recurrence_rule || undefined,
    externalId: row.external_id || undefined,
    externalSource: row.external_source || undefined,
    createdAt: row.created_at,
  }
}

interface UseCalendarOptions {
  startDate?: Date
  endDate?: Date
  category?: EventCategory
  assignedTo?: string
}

export function useCalendar(options?: UseCalendarOptions) {
  const { currentUser } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!currentUser?.stableId) {
      setIsLoading(false)
      return
    }

    async function fetchEvents() {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from("calendar_events")
        .select("*, horses(name)")
        .eq("stable_id", currentUser!.stableId)
        .order("start_time", { ascending: true })

      // Apply date filters if provided
      if (options?.startDate) {
        query = query.gte("start_time", options.startDate.toISOString())
      }
      if (options?.endDate) {
        query = query.lte("end_time", options.endDate.toISOString())
      }
      if (options?.category) {
        query = query.eq("category", options.category)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error("Failed to fetch events:", fetchError)
        setError(fetchError.message)
        setEvents([])
      } else {
        let mapped = (data || []).map((row) => mapRowToEvent(row as EventRow))

        // Filter by assigned staff if specified
        if (options?.assignedTo) {
          mapped = mapped.filter((e) => e.assignedTo.includes(options.assignedTo!))
        }

        setEvents(mapped)
      }

      setIsLoading(false)
    }

    fetchEvents()
  }, [currentUser?.stableId, supabase, refetchTrigger, options?.startDate?.toISOString(), options?.endDate?.toISOString(), options?.category, options?.assignedTo])

  const refetch = useCallback(() => setRefetchTrigger((n) => n + 1), [])

  return { events, isLoading, error, refetch }
}

export interface AddEventInput {
  title: string
  description?: string
  startTime: string
  endTime: string
  allDay?: boolean
  category?: EventCategory
  color?: string
  location?: string
  horseId?: string
  assignedTo?: string[]
  isRecurring?: boolean
  recurrenceRule?: string
}

export function useAddEvent() {
  const { currentUser } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const addEvent = useCallback(
    async (input: AddEventInput): Promise<{ success: boolean; error?: string; id?: string }> => {
      if (!currentUser?.stableId) {
        return { success: false, error: "No stable ID" }
      }

      const { data, error } = await supabase
        .from("calendar_events")
        .insert({
          stable_id: currentUser.stableId,
          title: input.title,
          description: input.description || null,
          start_time: input.startTime,
          end_time: input.endTime,
          all_day: input.allDay || false,
          category: input.category || "general",
          color: input.color || "#2C5F2E",
          location: input.location || null,
          horse_id: input.horseId || null,
          assigned_to: input.assignedTo || [],
          created_by: currentUser.id,
          is_recurring: input.isRecurring || false,
          recurrence_rule: input.recurrenceRule || null,
        })
        .select("id")
        .single()

      if (error) {
        console.error("addEvent error:", error)
        return { success: false, error: error.message }
      }

      return { success: true, id: data.id }
    },
    [currentUser, supabase]
  )

  return { addEvent }
}

export function useUpdateEvent() {
  const supabase = useMemo(() => createClient(), [])

  const updateEvent = useCallback(
    async (id: string, updates: Partial<AddEventInput>): Promise<boolean> => {
      const dbUpdates: Record<string, unknown> = {}
      if (updates.title !== undefined) dbUpdates.title = updates.title
      if (updates.description !== undefined) dbUpdates.description = updates.description || null
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime
      if (updates.allDay !== undefined) dbUpdates.all_day = updates.allDay
      if (updates.category !== undefined) dbUpdates.category = updates.category
      if (updates.color !== undefined) dbUpdates.color = updates.color
      if (updates.location !== undefined) dbUpdates.location = updates.location || null
      if (updates.horseId !== undefined) dbUpdates.horse_id = updates.horseId || null
      if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo
      if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring
      if (updates.recurrenceRule !== undefined) dbUpdates.recurrence_rule = updates.recurrenceRule || null

      const { error } = await supabase.from("calendar_events").update(dbUpdates).eq("id", id)

      if (error) {
        console.error("updateEvent error:", error)
        return false
      }
      return true
    },
    [supabase]
  )

  return { updateEvent }
}

export function useDeleteEvent() {
  const supabase = useMemo(() => createClient(), [])

  const deleteEvent = useCallback(
    async (id: string): Promise<boolean> => {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id)

      if (error) {
        console.error("deleteEvent error:", error)
        return false
      }
      return true
    },
    [supabase]
  )

  return { deleteEvent }
}
