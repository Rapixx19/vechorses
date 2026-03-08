/**
 * FILE: modules/settings/hooks/useTeam.ts
 * ZONE: Yellow
 * PURPOSE: Hook for team member state management from Supabase
 * EXPORTS: useTeam, useAddTeamMember, useUpdateTeamMember, useDeleteTeamMember
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: modules/settings/components/TeamManager
 * TESTS: modules/settings/tests/useTeam.test.ts
 * LAST CHANGED: 2026-03-08 — V2: Wired to Supabase team_members table
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import { getDefaultPermissions } from "@/lib/mock"
import type { TeamMember, ModulePermission, UserRole } from "@/lib/types"

// BREADCRUMB: DB row type from team_members table
interface TeamMemberRow {
  id: string
  stable_id: string
  full_name: string
  email: string
  role: string
  permissions: ModulePermission[] | null
  is_active: boolean | null
  invited_at: string | null
  last_login_at: string | null
  avatar_url: string | null
}

// BREADCRUMB: Map DB row to TeamMember type
function mapRowToTeamMember(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: (row.role as UserRole) || "staff",
    permissions: row.permissions || [],
    isActive: row.is_active ?? true,
    invitedAt: row.invited_at || new Date().toISOString(),
    lastLoginAt: row.last_login_at || undefined,
    avatarUrl: row.avatar_url || undefined,
  }
}

export function useTeam(): TeamMember[] {
  const { currentUser } = useAuth()
  const [team, setTeam] = useState<TeamMember[]>([])
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!currentUser?.stableId) {
      setTeam([])
      return
    }

    async function fetchTeam() {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("stable_id", currentUser!.stableId)
        .order("full_name")

      if (error) {
        console.error("Failed to fetch team:", error)
        setTeam([])
      } else {
        setTeam((data || []).map((row) => mapRowToTeamMember(row as TeamMemberRow)))
      }
    }

    fetchTeam()
  }, [currentUser?.stableId, supabase])

  return team
}

type NewMember = { fullName: string; email: string; role: UserRole; permissions: ModulePermission[] }

export function useAddTeamMember(): (member: NewMember) => Promise<TeamMember | null> {
  const { currentUser } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  return useCallback(
    async (data: NewMember) => {
      if (!currentUser?.stableId) return null

      const { data: inserted, error } = await supabase
        .from("team_members")
        .insert({
          stable_id: currentUser.stableId,
          full_name: data.fullName,
          email: data.email,
          role: data.role,
          permissions: data.permissions,
          is_active: true,
          invited_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Failed to add team member:", error)
        return null
      }

      return mapRowToTeamMember(inserted as TeamMemberRow)
    },
    [currentUser?.stableId, supabase]
  )
}

export function useUpdateTeamMember(): (id: string, updates: Partial<TeamMember>) => Promise<void> {
  const supabase = useMemo(() => createClient(), [])

  return useCallback(
    async (id: string, updates: Partial<TeamMember>) => {
      const dbUpdates: Record<string, unknown> = {}
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName
      if (updates.email !== undefined) dbUpdates.email = updates.email
      if (updates.role !== undefined) dbUpdates.role = updates.role
      if (updates.permissions !== undefined) dbUpdates.permissions = updates.permissions
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

      const { error } = await supabase.from("team_members").update(dbUpdates).eq("id", id)

      if (error) {
        console.error("Failed to update team member:", error)
      }
    },
    [supabase]
  )
}

export function useDeleteTeamMember(): (id: string) => Promise<void> {
  const supabase = useMemo(() => createClient(), [])

  return useCallback(
    async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id)

      if (error) {
        console.error("Failed to delete team member:", error)
      }
    },
    [supabase]
  )
}

export { getDefaultPermissions }
