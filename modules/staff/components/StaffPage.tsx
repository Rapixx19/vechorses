/**
 * FILE: modules/staff/components/StaffPage.tsx
 * ZONE: Green
 * PURPOSE: Main staff management page with grid, stats, and modals
 * EXPORTS: StaffPage
 * DEPENDS ON: useStaff, useHorses, StaffCard, StaffDetail, StaffForm, TaskAssignSheet
 * CONSUMED BY: app/staff/page.tsx
 * TESTS: modules/staff/tests/StaffPage.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for staff management
 */

"use client"

import { useState } from "react"
import { UserPlus, Loader2 } from "lucide-react"
import { useStaff, useUpdateStaff } from "../hooks/useStaff"
import { useHorses } from "@/modules/horses"
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2C5F2E]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Staff</h1>
        <button
          onClick={() => setModalState({ type: "form" })}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
          style={{ backgroundColor: "#2C5F2E" }}
        >
          <UserPlus className="h-4 w-4" />
          Add Staff Member
        </button>
      </div>

      {/* Stats Bar */}
      <div className="rounded-lg p-4 grid grid-cols-4 gap-4" style={{ backgroundColor: "#1A1A2E" }}>
        <div>
          <p className="text-2xl font-bold text-white">{totalStaff}</p>
          <p className="text-sm text-gray-400">Total Staff</p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <p className="text-2xl font-bold text-white">{workingNow}</p>
          </div>
          <p className="text-sm text-gray-400">Working Now</p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <p className="text-2xl font-bold text-white">{onVacation}</p>
          </div>
          <p className="text-sm text-gray-400">On Vacation</p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <p className="text-2xl font-bold text-white">{dayOff}</p>
          </div>
          <p className="text-sm text-gray-400">Day Off</p>
        </div>
      </div>

      {/* Staff Grid */}
      {staff.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-2">No staff members yet</p>
          <button
            onClick={() => setModalState({ type: "form" })}
            className="text-sm text-green-400 hover:underline"
          >
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
