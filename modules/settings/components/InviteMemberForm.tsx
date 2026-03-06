/**
 * FILE: modules/settings/components/InviteMemberForm.tsx
 * ZONE: Green
 * PURPOSE: Sheet form for inviting new team members with custom permissions
 * EXPORTS: InviteMemberForm
 * DEPENDS ON: react-hook-form, zod, lib/types, useTeam
 * CONSUMED BY: TeamManager
 * TESTS: modules/settings/tests/InviteMemberForm.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for team management
 */

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"
import { useAddTeamMember, getDefaultPermissions } from "../hooks/useTeam"
import type { UserRole, ModuleName, ModulePermission } from "@/lib/types"
import { useState } from "react"

const schema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  role: z.enum(["owner", "manager", "staff", "custom"]),
})

type FormData = z.infer<typeof schema>

interface InviteMemberFormProps {
  onClose: () => void
}

const modules: ModuleName[] = ["dashboard", "horses", "clients", "stalls", "billing", "services", "settings"]
const roles: { value: UserRole; label: string }[] = [
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
  { value: "custom", label: "Custom" },
]

export function InviteMemberForm({ onClose }: InviteMemberFormProps) {
  const addMember = useAddTeamMember()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "staff" },
  })
  const selectedRole = watch("role")
  const [permissions, setPermissions] = useState<ModulePermission[]>(getDefaultPermissions("staff"))

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole
    setPermissions(getDefaultPermissions(role))
  }

  const togglePerm = (module: ModuleName, key: "canView" | "canEdit" | "canDelete") => {
    setPermissions((prev) => prev.map((p) => (p.module === module ? { ...p, [key]: !p[key] } : p)))
  }

  const onSubmit = (data: FormData) => {
    addMember({ ...data, permissions })
    alert(`Invite sent to ${data.email} — real email in V2`)
    onClose()
  }

  const inputClass = "w-full px-3 py-2 rounded-md text-sm bg-[#252538] border border-[#3A3A52] text-[var(--text-primary)] focus:outline-none focus:border-[#2C5F2E]"
  const labelClass = "block text-sm font-medium text-[var(--text-muted)] mb-1"

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1A1A2E] h-full overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-[#252538] bg-[#1A1A2E]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Invite Team Member</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#252538]"><X className="h-5 w-5 text-[var(--text-muted)]" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div><label className={labelClass}>Full Name *</label><input {...register("fullName")} className={inputClass} />{errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}</div>
          <div><label className={labelClass}>Email *</label><input {...register("email")} className={inputClass} />{errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}</div>
          <div><label className={labelClass}>Role *</label><select {...register("role")} onChange={handleRoleChange} className={inputClass}>{roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>

          {/* Permission Matrix */}
          <div>
            <label className={labelClass}>Permissions {selectedRole === "custom" && "(customise below)"}</label>
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

          <button type="submit" className="w-full px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#2C5F2E" }}>Send Invite</button>
        </form>
      </div>
    </div>
  )
}
