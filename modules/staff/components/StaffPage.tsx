/**
 * FILE: modules/staff/components/StaffPage.tsx
 * ZONE: Green
 * PURPOSE: Main staff management page with grid, stats, and modals
 * EXPORTS: StaffPage
 * DEPENDS ON: useStaff, useHorses, StaffCard, StaffDetail, StaffForm, TaskAssignSheet, Skeleton
 * CONSUMED BY: app/staff/page.tsx
 * TESTS: modules/staff/tests/StaffPage.test.tsx
 * LAST CHANGED: 2026-03-07 — UI overhaul with skeleton loading
 */

"use client"

import { useState } from "react"
import { UserPlus, Users2 } from "lucide-react"
import { useStaff, useUpdateStaff } from "../hooks/useStaff"
import { useHorses } from "@/modules/horses"
import { Skeleton } from "@/modules/dashboard"
import { StaffCard } from "./StaffCard"
import { StaffDetail } from "./StaffDetail"
import { StaffForm } from "./StaffForm"
import { TaskAssignSheet } from "./TaskAssignSheet"
import type { StaffMember, StaffStatusDetail } from "@/lib/types"

type ModalState =
  | { type: "detail"; member: StaffMember }
  | { type: "form"; member?: StaffMember }
  | { type: "assign-task"; member: StaffMember }
  | null

// BREADCRUMB: Skeleton loading state for StaffPage
function StaffPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="card p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-8 w-12 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    </div>
  )
}

export function StaffPage() {
  const { staff, isLoading, refetch } = useStaff()
  const { horses } = useHorses()
  const { updateStatus } = useUpdateStaff()
  const [modalState, setModalState] = useState<ModalState>(null)

  // BREADCRUMB: Stats calculations
  const totalStaff = staff.length
  const workingNow = staff.filter((s) => s.statusDetail === "working").length
  const onVacation = staff.filter((s) => s.statusDetail === "vacation").length
  const dayOff = staff.filter((s) => s.statusDetail === "day-off").length

  const handleStatusChange = async (memberId: string, status: StaffStatusDetail) => {
    await updateStatus(memberId, status)
    refetch()
  }

  if (isLoading) {
    return <StaffPageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Staff</h1>
        <button onClick={() => setModalState({ type: "form" })} className="btn btn-primary min-h-[44px]">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Staff Member</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="card p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{totalStaff}</p>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">Total Staff</p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
            <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{workingNow}</p>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">Working Now</p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
            <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{onVacation}</p>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">On Vacation</p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-500" />
            <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{dayOff}</p>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">Day Off</p>
        </div>
      </div>

      {/* Staff Grid */}
      {staff.length === 0 ? (
        <div className="empty-state card">
          <Users2 className="h-12 w-12 text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-primary)] font-medium mb-2">No staff members yet</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">Add your first team member to get started</p>
          <button onClick={() => setModalState({ type: "form" })} className="btn btn-primary">
            <UserPlus className="h-4 w-4" />
            Add your first staff member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              onClick={() => setModalState({ type: "detail", member })}
              onStatusChange={(status) => handleStatusChange(member.id, status)}
            />
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      {modalState?.type === "detail" && (
        <StaffDetail
          member={modalState.member}
          onClose={() => setModalState(null)}
          onEdit={() => setModalState({ type: "form", member: modalState.member })}
          onAssignTask={() => setModalState({ type: "assign-task", member: modalState.member })}
          onRefetch={refetch}
        />
      )}

      {/* Form Modal */}
      {modalState?.type === "form" && (
        <StaffForm
          member={modalState.member}
          onClose={() => setModalState(null)}
          onSuccess={refetch}
        />
      )}

      {/* Task Assign Sheet */}
      {modalState?.type === "assign-task" && (
        <TaskAssignSheet
          memberId={modalState.member.id}
          memberName={modalState.member.fullName}
          horses={horses}
          onClose={() => setModalState({ type: "detail", member: modalState.member })}
          onSuccess={refetch}
        />
      )}
    </div>
  )
}
