/**
 * FILE: modules/services/hooks/useServices.ts
 * ZONE: Yellow
 * PURPOSE: Hook for service catalogue state management with Supabase
 * EXPORTS: useServices, useServicesByCategory, useAddService, useUpdateService, useDeleteService
 * DEPENDS ON: lib/supabase, lib/types, lib/hooks/useAuth
 * CONSUMED BY: ServiceGrid, ServiceForm, NewBillingItemForm
 * TESTS: modules/services/tests/useServices.test.ts
 * LAST CHANGED: 2026-03-07 — V2: Wired to Supabase, removed mock data fallbacks
 */

"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { Service, ServiceCategory } from "@/lib/types"

// DB row type from Supabase
interface ServiceRow {
  id: string
  stable_id: string
  name: string
  description: string | null
  category: string | null
  price: number | null
  currency: string | null
  unit: string | null
  unit_label: string | null
  photo_url: string | null
  is_active: boolean | null
  created_at: string | null
}

interface UseServicesReturn {
  services: Service[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

// BREADCRUMB: Map DB row to frontend Service type
function mapRowToService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    category: (row.category as ServiceCategory) || "other",
    price: row.price || 0,
    currency: row.currency || "EUR",
    unit: (row.unit as Service["unit"]) || "per_session",
    unitLabel: row.unit_label || undefined,
    photoUrl: row.photo_url || undefined,
    isActive: row.is_active ?? true,
    createdAt: row.created_at || "",
  }
}

export function useServices(): UseServicesReturn {
  const { currentUser } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // If logged in but no stableId, show empty state (NOT mock data)
    if (currentUser && !currentUser.stableId) {
      console.warn("useServices: User logged in but stableId is missing - showing empty state")
      setServices([])
      setIsLoading(false)
      return
    }

    // Not logged in yet
    if (!currentUser?.stableId) {
      setServices([])
      setIsLoading(false)
      return
    }

    async function fetchServices() {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("services")
        .select("*")
        .eq("stable_id", currentUser!.stableId)
        .eq("is_active", true)
        .order("name")

      if (fetchError) {
        console.error("Failed to fetch services:", fetchError)
        setError(fetchError.message)
        setServices([])
      } else {
        const mapped = (data || []).map(mapRowToService)
        setServices(mapped)
      }

      setIsLoading(false)
    }

    fetchServices()
  }, [currentUser?.stableId, supabase, refetchTrigger])

  const refetch = useCallback(() => setRefetchTrigger((n) => n + 1), [])

  return { services, isLoading, error, refetch }
}

export function useServicesByCategory(category: ServiceCategory | "all"): Service[] {
  const { services } = useServices()
  return useMemo(() => {
    if (category === "all") return services
    return services.filter((s) => s.category === category)
  }, [services, category])
}

// BREADCRUMB: Insert service to Supabase
export function useAddService(): {
  addService: (service: Omit<Service, "id" | "createdAt">) => Promise<Service | null>
  isAdding: boolean
} {
  const { currentUser } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const addService = useCallback(
    async (service: Omit<Service, "id" | "createdAt">): Promise<Service | null> => {
      if (!currentUser?.stableId) {
        console.error("addService: no stableId")
        return null
      }

      setIsAdding(true)

      const { data, error } = await supabase
        .from("services")
        .insert({
          stable_id: currentUser.stableId,
          name: service.name,
          description: service.description || null,
          category: service.category || "other",
          price: service.price || 0,
          currency: service.currency || "EUR",
          unit: service.unit || null,
          unit_label: service.unitLabel || null,
          is_active: true,
        })
        .select()
        .single()

      setIsAdding(false)

      if (error) {
        console.error("addService error:", JSON.stringify(error))
        return null
      }

      return mapRowToService(data)
    },
    [currentUser?.stableId, supabase]
  )

  return { addService, isAdding }
}

// BREADCRUMB: Update service in Supabase
export function useUpdateService(): {
  updateService: (id: string, updates: Partial<Service>) => Promise<boolean>
  isUpdating: boolean
} {
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const updateService = useCallback(
    async (id: string, updates: Partial<Service>): Promise<boolean> => {
      setIsUpdating(true)

      const dbUpdates: Record<string, unknown> = {}
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.description !== undefined) dbUpdates.description = updates.description || null
      if (updates.category !== undefined) dbUpdates.category = updates.category
      if (updates.price !== undefined) dbUpdates.price = updates.price
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency
      if (updates.unit !== undefined) dbUpdates.unit = updates.unit || null
      if (updates.unitLabel !== undefined) dbUpdates.unit_label = updates.unitLabel || null
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

      const { error } = await supabase.from("services").update(dbUpdates).eq("id", id)

      setIsUpdating(false)

      if (error) {
        console.error("updateService error:", JSON.stringify(error))
        return false
      }

      return true
    },
    [supabase]
  )

  return { updateService, isUpdating }
}

// BREADCRUMB: Soft delete service in Supabase
export function useDeleteService(): {
  deleteService: (id: string) => Promise<boolean>
  isDeleting: boolean
} {
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const deleteService = useCallback(
    async (id: string): Promise<boolean> => {
      setIsDeleting(true)

      // Soft delete by setting is_active = false
      const { error } = await supabase.from("services").update({ is_active: false }).eq("id", id)

      setIsDeleting(false)

      if (error) {
        console.error("deleteService error:", JSON.stringify(error))
        return false
      }

      return true
    },
    [supabase]
  )

  return { deleteService, isDeleting }
}
