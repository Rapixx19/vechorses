/**
 * FILE: modules/staff/hooks/useStaff.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch and manage staff members and tasks from Supabase
 * EXPORTS: useStaff, useStaffTasks, useAddStaff, useUpdateStaff, useStaffActions
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: modules/staff/components/*
 * TESTS: modules/staff/tests/useStaff.test.ts
 * LAST CHANGED: 2026-03-07 — Initial creation for staff management
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { StaffMember, StaffTask, StaffStatusDetail, ContractType, TaskPriority, TaskCategory, UserRole } from "@/lib/types"

// BREADCRUMB: DB row types
interface TeamMemberRow {
  id: string
  stable_id: string
  full_name: string
  email: string
  phone: string | null
  address: string | null
  date_of_birth: string | null
  start_date: string | null
  contract_type: string | null
  status_detail: string | null
  vacation_start: string | null
  vacation_end: string | null
  notes: string | null
  color: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  role: string
  is_active: boolean
  avatar_url: string | null
}

interface StaffTaskRow {
  id: string
  stable_id: string
  assigned_to: string
  assigned_by: string | null
  title: string
  description: string | null
  priority: string
  status: string
  due_date: string | null
  due_time: string | null
  completed_at: string | null
  category: string
  horse_id: string | null
  created_at: string
  horses?: { name: string } | null
}

// BREADCRUMB: Map DB row to StaffMember
function mapRowToStaffMember(row: TeamMemberRow, taskCount: number = 0): StaffMember {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone || undefined,
    address: row.address || undefined,
    dateOfBirth: row.date_of_birth || undefined,
    startDate: row.start_date || undefined,
    contractType: (row.contract_type as ContractType) || "full-time",
    statusDetail: (row.status_detail as StaffStatusDetail) || "working",
    vacationStart: row.vacation_start || undefined,
    vacationEnd: row.vacation_end || undefined,
    notes: row.notes || undefined,
    color: row.color || undefined,
    emergencyContactName: row.emergency_contact_name || undefined,
    emergencyContactPhone: row.emergency_contact_phone || undefined,
    role: (row.role as UserRole) || "staff",
    isActive: row.is_active,
    avatarUrl: row.avatar_url || undefined,
    pendingTasksCount: taskCount,
  }
}

// BREADCRUMB: Map DB row to StaffTask
function mapRowToStaffTask(row: StaffTaskRow): StaffTask {
  return {
    id: row.id,
    stableId: row.stable_id,
    assignedTo: row.assigned_to,
    assignedBy: row.assigned_by || undefined,
    title: row.title,
    description: row.description || undefined,
    priority: (row.priority as TaskPriority) || "medium",
    status: row.status as StaffTask["status"],
    dueDate: row.due_date || undefined,
    dueTime: row.due_time || undefined,
    completedAt: row.completed_at || undefined,
    category: (row.category as TaskCategory) || "general",
    horseId: row.horse_id || undefined,
    horseName: row.horses?.name,
    createdAt: row.created_at,
  }
}

export function useStaff() {
  const { currentUser } = useAuth()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!currentUser?.stableId) {
      setIsLoading(false)
      return
    }

    async function fetchStaff() {
      setIsLoading(true)
      setError(null)

      // Fetch team members
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .eq("stable_id", currentUser!.stableId)
        .order("full_name")

      if (membersError) {
        console.error("Failed to fetch staff:", membersError)
        setError(membersError.message)
        setStaff([])
        setIsLoading(false)
        return
      }

      // Fetch pending task counts per member
      const { data: taskCounts } = await supabase
        .from("staff_tasks")
        .select("assigned_to")
        .eq("stable_id", currentUser!.stableId)
        .eq("status", "pending")

      const countMap = new Map<string, number>()
      taskCounts?.forEach((t) => {
        countMap.set(t.assigned_to, (countMap.get(t.assigned_to) || 0) + 1)
      })

      const mapped = (members || []).map((row) =>
        mapRowToStaffMember(row as TeamMemberRow, countMap.get(row.id) || 0)
      )
      setStaff(mapped)
      setIsLoading(false)
    }

    fetchStaff()
  }, [currentUser?.stableId, supabase, refetchTrigger])

  const refetch = useCallback(() => setRefetchTrigger((n) => n + 1), [])

  return { staff, isLoading, error, refetch }
}

export function useStaffTasks(memberId?: string) {
  const { currentUser } = useAuth()
  const [tasks, setTasks] = useState<StaffTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!currentUser?.stableId) {
      setIsLoading(false)
      return
    }

    async function fetchTasks() {
      setIsLoading(true)

      let query = supabase
        .from("staff_tasks")
        .select("*, horses(name)")
        .eq("stable_id", currentUser!.stableId)
        .order("due_date", { ascending: true, nullsFirst: false })

      if (memberId) {
        query = query.eq("assigned_to", memberId)
      }

      const { data, error } = await query

      if (error) {
        console.error("Failed to fetch tasks:", error)
        setTasks([])
      } else {
        setTasks((data || []).map((row) => mapRowToStaffTask(row as StaffTaskRow)))
      }

      setIsLoading(false)
    }

    fetchTasks()
  }, [currentUser?.stableId, memberId, supabase, refetchTrigger])

  const refetch = useCallback(() => setRefetchTrigger((n) => n + 1), [])

  return { tasks, isLoading, refetch }
}

export interface AddStaffInput {
  fullName: string
  email: string
  phone?: string
  role?: UserRole
  contractType?: ContractType
  startDate?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  notes?: string
  color?: string
}

export function useAddStaff() {
  const { currentUser } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const addStaff = async (input: AddStaffInput): Promise<{ success: boolean; error?: string; id?: string }> => {
    if (!currentUser?.stableId) {
      return { success: false, error: "No stable ID" }
    }

    const { data, error } = await supabase
      .from("team_members")
      .insert({
        stable_id: currentUser.stableId,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone || null,
        role: input.role || "staff",
        contract_type: input.contractType || "full-time",
        start_date: input.startDate || null,
        address: input.address || null,
        emergency_contact_name: input.emergencyContactName || null,
        emergency_contact_phone: input.emergencyContactPhone || null,
        notes: input.notes || null,
        color: input.color || null,
        status_detail: "working",
        is_active: true,
      })
      .select("id")
      .single()

    if (error) {
      console.error("addStaff error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data.id }
  }

  return { addStaff }
}

export function useUpdateStaff() {
  const supabase = useMemo(() => createClient(), [])

  const updateStaff = useCallback(
    async (id: string, updates: Partial<AddStaffInput>): Promise<boolean> => {
      const dbUpdates: Record<string, unknown> = {}
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName
      if (updates.email !== undefined) dbUpdates.email = updates.email
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone || null
      if (updates.role !== undefined) dbUpdates.role = updates.role
      if (updates.contractType !== undefined) dbUpdates.contract_type = updates.contractType
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate || null
      if (updates.address !== undefined) dbUpdates.address = updates.address || null
      if (updates.emergencyContactName !== undefined) dbUpdates.emergency_contact_name = updates.emergencyContactName || null
      if (updates.emergencyContactPhone !== undefined) dbUpdates.emergency_contact_phone = updates.emergencyContactPhone || null
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null
      if (updates.color !== undefined) dbUpdates.color = updates.color || null

      const { error } = await supabase.from("team_members").update(dbUpdates).eq("id", id)

      if (error) {
        console.error("updateStaff error:", error)
        return false
      }
      return true
    },
    [supabase]
  )

  const updateStatus = useCallback(
    async (
      id: string,
      status: StaffStatusDetail,
      vacationStart?: string,
      vacationEnd?: string
    ): Promise<boolean> => {
      const updates: Record<string, unknown> = {
        status_detail: status,
        vacation_start: status === "vacation" ? vacationStart || null : null,
        vacation_end: status === "vacation" ? vacationEnd || null : null,
      }

      const { error } = await supabase.from("team_members").update(updates).eq("id", id)

      if (error) {
        console.error("updateStatus error:", error)
        return false
      }
      return true
    },
    [supabase]
  )

  return { updateStaff, updateStatus }
}

export interface AssignTaskInput {
  assignedTo: string
  title: string
  description?: string
  priority?: TaskPriority
  category?: TaskCategory
  dueDate?: string
  dueTime?: string
  horseId?: string
}

export function useStaffActions() {
  const { currentUser } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const assignTask = useCallback(
    async (input: AssignTaskInput): Promise<{ success: boolean; error?: string; id?: string }> => {
      if (!currentUser?.stableId) {
        return { success: false, error: "No stable ID" }
      }

      const { data, error } = await supabase
        .from("staff_tasks")
        .insert({
          stable_id: currentUser.stableId,
          assigned_to: input.assignedTo,
          assigned_by: currentUser.id,
          title: input.title,
          description: input.description || null,
          priority: input.priority || "medium",
          category: input.category || "general",
          due_date: input.dueDate || null,
          due_time: input.dueTime || null,
          horse_id: input.horseId || null,
          status: "pending",
        })
        .select("id")
        .single()

      if (error) {
        console.error("assignTask error:", error)
        return { success: false, error: error.message }
      }

      return { success: true, id: data.id }
    },
    [currentUser, supabase]
  )

  const completeTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      const { error } = await supabase
        .from("staff_tasks")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", taskId)

      if (error) {
        console.error("completeTask error:", error)
        return false
      }
      return true
    },
    [supabase]
  )

  const deleteTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      const { error } = await supabase.from("staff_tasks").delete().eq("id", taskId)

      if (error) {
        console.error("deleteTask error:", error)
        return false
      }
      return true
    },
    [supabase]
  )

  return { assignTask, completeTask, deleteTask }
}
