/**
 * FILE: modules/settings/components/TeamManager.tsx
 * ZONE: Green
 * PURPOSE: Team member list with invite and edit actions
 * EXPORTS: TeamManager
 * DEPENDS ON: lib/types, useTeam, lucide-react
 * CONSUMED BY: app/settings/page.tsx
 * TESTS: modules/settings/tests/TeamManager.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for team management
 */

"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { useTeam, useDeleteTeamMember } from "../hooks/useTeam"
import { InviteMemberForm } from "./InviteMemberForm"
import { EditMemberForm } from "./EditMemberForm"
import type { TeamMember } from "@/lib/types"

const roleColors: Record<string, string> = {
  owner: "bg-purple-500/20 text-purple-400",
  manager: "bg-blue-500/20 text-blue-400",
  staff: "bg-green-500/20 text-green-400",
  custom: "bg-gray-500/20 text-gray-400",
}

export function TeamManager() {
  const team = useTeam()
  const deleteMember = useDeleteTeamMember()
  const [showInvite, setShowInvite] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Never"
    return new Date(dateStr).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })
  }

  const handleDelete = (member: TeamMember) => {
    if (member.role === "owner") return alert("Cannot remove the owner")
    if (confirm(`Remove ${member.fullName} from the team?`)) deleteMember(member.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{team.length} team members</p>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#2C5F2E" }}>
          <Plus className="h-4 w-4" />Invite Member
        </button>
      </div>

      <div className="space-y-2">
        {team.map((member) => (
          <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg bg-[#252538]">
            <div className="w-10 h-10 rounded-full bg-[#2C5F2E] flex items-center justify-center text-sm font-medium text-white">
              {member.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--text-primary)]">{member.fullName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${roleColors[member.role]}`}>{member.role}</span>
                {!member.isActive && <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400">Inactive</span>}
              </div>
              <p className="text-xs text-[var(--text-muted)]">{member.email}</p>
            </div>
            <div className="text-right text-xs text-[var(--text-muted)]">
              <p>Last login: {formatDate(member.lastLoginAt)}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditingMember(member)} className="p-2 rounded hover:bg-[#1A1A2E] text-[var(--text-muted)]"><Edit2 className="h-4 w-4" /></button>
              {member.role !== "owner" && <button onClick={() => handleDelete(member)} className="p-2 rounded hover:bg-[#1A1A2E] text-red-400"><Trash2 className="h-4 w-4" /></button>}
            </div>
          </div>
        ))}
      </div>

      {showInvite && <InviteMemberForm onClose={() => setShowInvite(false)} />}
      {editingMember && <EditMemberForm member={editingMember} onClose={() => setEditingMember(null)} />}
    </div>
  )
}
