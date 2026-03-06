/**
 * FILE: modules/services/hooks/useServices.ts
 * ZONE: Yellow
 * PURPOSE: Hook for service catalogue state management
 * EXPORTS: useServices, useServicesByCategory, useAddService, useUpdateService, useDeleteService
 * DEPENDS ON: lib/mock/services, lib/types
 * CONSUMED BY: ServiceGrid, ServiceForm, NewBillingItemForm
 * TESTS: modules/services/tests/useServices.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation for service management
 */

"use client"

import { useState, useCallback, useMemo } from "react"
import { mockServices } from "@/lib/mock"
import type { Service, ServiceCategory } from "@/lib/types"

// Shared state across hook instances (V1 mock approach)
let globalServices: Service[] = [...mockServices]
const listeners: Set<() => void> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function useServices(): Service[] {
  const [, forceUpdate] = useState({})

  useState(() => {
    const listener = () => forceUpdate({})
    listeners.add(listener)
    return () => listeners.delete(listener)
  })

  return globalServices
}

export function useServicesByCategory(category: ServiceCategory | "all"): Service[] {
  const services = useServices()
  return useMemo(() => {
    if (category === "all") return services
    return services.filter((s) => s.category === category)
  }, [services, category])
}

export function useAddService(): (service: Omit<Service, "id" | "createdAt">) => Service {
  return useCallback((data) => {
    const service: Service = { ...data, id: `svc-${Date.now()}`, createdAt: new Date().toISOString() }
    globalServices = [service, ...globalServices]
    notifyListeners()
    return service
  }, [])
}

export function useUpdateService(): (id: string, updates: Partial<Service>) => void {
  return useCallback((id, updates) => {
    globalServices = globalServices.map((s) => (s.id === id ? { ...s, ...updates } : s))
    notifyListeners()
  }, [])
}

export function useDeleteService(): (id: string) => void {
  return useCallback((id) => {
    globalServices = globalServices.filter((s) => s.id !== id)
    notifyListeners()
  }, [])
}
