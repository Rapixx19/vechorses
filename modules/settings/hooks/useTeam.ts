/**
 * FILE: modules/settings/hooks/useTeam.ts
 * ZONE: Yellow
 * PURPOSE: Hook for team member state management
 * EXPORTS: useTeam, useAddTeamMember, useUpdateTeamMember, useDeleteTeamMember
 * DEPENDS ON: lib/mock/team, lib/types
 * CONSUMED BY: modules/settings/components/TeamManager
 * TESTS: modules/settings/tests/useTeam.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation for team management
 */

"use client"

import { useState, useCallback } from "react"
import { mockTeamMembers, getDefaultPermissions } from "@/lib/mock"
import type { TeamMember, ModulePermission, UserRole } from "@/lib/types"

// Shared state across hook instances (V1 mock approach)
let globalTeam: TeamMember[] = [...mockTeamMembers]
const listeners: Set<() => void> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function useTeam(): TeamMember[] {
  const [, forceUpdate] = useState({})

  useState(() => {
    const listener = () => forceUpdate({})
    listeners.add(listener)
    return () => listeners.delete(listener)
  })

  return globalTeam
}

type NewMember = { fullName: string; email: string; role: UserRole; permissions: ModulePermission[] }

export function useAddTeamMember(): (member: NewMember) => TeamMember {
  return useCallback((data) => {
    const member: TeamMember = {
      ...data,
      id: `user-${Date.now()}`,
      isActive: true,
      invitedAt: new Date().toISOString(),
    }
    globalTeam = [...globalTeam, member]
    notifyListeners()
    return member
  }, [])
}

export function useUpdateTeamMember(): (id: string, updates: Partial<TeamMember>) => void {
  return useCallback((id, updates) => {
    globalTeam = globalTeam.map((m) => (m.id === id ? { ...m, ...updates } : m))
    notifyListeners()
  }, [])
}

export function useDeleteTeamMember(): (id: string) => void {
  return useCallback((id) => {
    globalTeam = globalTeam.filter((m) => m.id !== id)
    notifyListeners()
  }, [])
}

export { getDefaultPermissions }
