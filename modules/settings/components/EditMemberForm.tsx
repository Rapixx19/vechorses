/**
 * FILE: modules/settings/components/EditMemberForm.tsx
 * ZONE: Green
 * PURPOSE: Sheet form for editing team member role and permissions
 * EXPORTS: EditMemberForm
 * DEPENDS ON: react-hook-form, zod, lib/types, useTeam
 * CONSUMED BY: TeamManager
 * TESTS: modules/settings/tests/EditMemberForm.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for team management
 */

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"
import { useUpdateTeamMember, getDefaultPermissions } from "../hooks/useTeam"
import type { TeamMember, UserRole, ModuleName, ModulePermission } from "@/lib/types"
import { useState } from "react"

const schema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  role: z.enum(["owner", "manager", "staff", "custom"]),
  isActive: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface EditMemberFormProps {
  member: TeamMember
  onClose: () => void
}

const modules: ModuleName[] = ["dashboard", "horses", "clients", "stalls", "billing", "services", "settings"]
const roles: { value: UserRole; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
  { value: "custom", label: "Custom" },
]

export function EditMemberForm({ member, onClose }: EditMemberFormProps) {
  const updateMember = useUpdateTeamMember()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: member.fullName, email: member.email, role: member.role, isActive: member.isActive },
  })
  const [permissions, setPermissions] = useState<ModulePermission[]>(member.permissions)

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole
    setPermissions(getDefaultPermissions(role))
  }

  const togglePerm = (module: ModuleName, key: "canView" | "canEdit" | "canDelete") => {
    setPermissions((prev) => prev.map((p) => (p.module === module ? { ...p, [key]: !p[key] } : p)))
  }

  const onSubmit = (data: FormData) => {
    updateMember(member.id, { ...data, permissions })
    onClose()
  }

  const inputClass = "w-full px-3 py-2 rounded-md text-sm bg-[#252538] border border-[#3A3A52] text-[var(--text-primary)] focus:outline-none focus:border-[#2C5F2E]"
  const labelClass = "block text-sm font-medium text-[var(--text-muted)] mb-1"
  const isOwner = member.role === "owner"

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1A1A2E] h-full overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-[#252538] bg-[#1A1A2E]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Edit Team Member</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#252538]"><X className="h-5 w-5 text-[var(--text-muted)]" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div><label className={labelClass}>Full Name</label><input {...register("fullName")} className={inputClass} disabled={isOwner} />{errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}</div>
          <div><label className={labelClass}>Email</label><input {...register("email")} className={inputClass} disabled={isOwner} /></div>
          <div><label className={labelClass}>Role</label><select {...register("role")} onChange={handleRoleChange} className={inputClass} disabled={isOwner}>{roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" {...register("isActive")} className="w-4 h-4 rounded" disabled={isOwner} />
            <label htmlFor="isActive" className="text-sm text-[var(--text-primary)]">Active</label>
          </div>

          {/* Permission Matrix */}
          {!isOwner && (
            <div>
              <label className={labelClass}>Permissions</label>
              <div className="mt-2 rounded-lg border border-[#3A3A52] overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#252538]"><th className="text-left px-3 py-2 text-[var(--text-muted)] font-medium">Module</th><th className="px-3 py-2 text-center text-[var(--text-muted)] font-medium">View</th><th className="px-3 py-2 text-center text-[var(--text-muted)] font-medium">Edit</th><th className="px-3 py-2 text-center text-[var(--text-muted)] font-medium">Delete</th></tr></thead>
                  <tbody>
                    {modules.map((mod) => {
                      const perm = permissions.find((p) => p.module === mod)!
                      return (
                        <tr key={mod} className="border-t border-[#3A3A52]">
                          <td className="px-3 py-2 text-[var(--text-primary)] capitalize">{mod}</td>
                          <td className="px-3 py-2 text-center"><input type="checkbox" checked={perm.canView} onChange={() => togglePerm(mod, "canView")} className="w-4 h-4 rounded" /></td>
                          <td className="px-3 py-2 text-center"><input type="checkbox" checked={perm.canEdit} onChange={() => togglePerm(mod, "canEdit")} className="w-4 h-4 rounded" /></td>
                          <td className="px-3 py-2 text-center"><input type="checkbox" checked={perm.canDelete} onChange={() => togglePerm(mod, "canDelete")} className="w-4 h-4 rounded" /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button type="submit" className="w-full px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#2C5F2E" }}>Save Changes</button>
        </form>
      </div>
    </div>
  )
}
