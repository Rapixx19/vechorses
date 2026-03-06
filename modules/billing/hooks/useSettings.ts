/**
 * FILE: modules/billing/hooks/useSettings.ts
 * ZONE: 🔴 Red
 * PURPOSE: Hook for stable settings state management
 * EXPORTS: useSettings, useUpdateSettings
 * DEPENDS ON: lib/mock/settings, lib/types
 * CONSUMED BY: InvoiceBuilder, app/settings/page.tsx
 * TESTS: modules/billing/tests/useSettings.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation for Phase 7b
 */

// 🔴 RED ZONE — billing settings, handle with care

"use client"

import { useState, useCallback } from "react"
import { mockStableSettings } from "@/lib/mock"
import type { StableSettings } from "@/lib/types"

// Shared state across hook instances (V1 mock approach)
let globalSettings: StableSettings = { ...mockStableSettings }
const listeners: Set<() => void> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function useSettings(): StableSettings {
  const [, forceUpdate] = useState({})

  // Subscribe to updates
  useState(() => {
    const listener = () => forceUpdate({})
    listeners.add(listener)
    return () => listeners.delete(listener)
  })

  return globalSettings
}

export function useUpdateSettings(): (updates: Partial<StableSettings>) => void {
  return useCallback((updates: Partial<StableSettings>) => {
    globalSettings = { ...globalSettings, ...updates }
    notifyListeners()
  }, [])
}
