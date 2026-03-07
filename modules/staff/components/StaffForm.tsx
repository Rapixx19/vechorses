/**
 * FILE: modules/staff/components/StaffForm.tsx
 * ZONE: Green
 * PURPOSE: Form to add or edit a staff member
 * EXPORTS: StaffForm
 * DEPENDS ON: lib/types.ts, lucide-react
 * CONSUMED BY: StaffPage
 * TESTS: modules/staff/tests/StaffForm.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for staff management
 */

"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { StaffMember, UserRole, ContractType } from "@/lib/types"
import { useAddStaff, useUpdateStaff, type AddStaffInput } from "../hooks/useStaff"

interface StaffFormProps {
  member?: StaffMember
  onClose: () => void
  onSuccess: () => void
}

// BREADCRUMB: Preset avatar colors
const AVATAR_COLORS = [
  { value: "#2C5F2E", label: "Green" },
  { value: "#1E40AF", label: "Blue" },
  { value: "#7C3AED", label: "Purple" },
  { value: "#DC2626", label: "Red" },
  { value: "#EA580C", label: "Orange" },
  { value: "#0891B2", label: "Teal" },
]

const ROLES: { value: UserRole; label: string }[] = [
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
  { value: "custom", label: "Custom" },
]

const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "freelance", label: "Freelance" },
]

export function StaffForm({ member, onClose, onSuccess }: StaffFormProps) {
  const isEditing = !!member
  const { addStaff } = useAddStaff()
  const { updateStaff } = useUpdateStaff()

  const [fullName, setFullName] = useState(member?.fullName || "")
  const [email, setEmail] = useState(member?.email || "")
  const [phone, setPhone] = useState(member?.phone || "")
  const [role, setRole] = useState<UserRole>(member?.role || "staff")
  const [contractType, setContractType] = useState<ContractType>(member?.contractType || "full-time")
  const [startDate, setStartDate] = useState(member?.startDate || "")
  const [address, setAddress] = useState(member?.address || "")
  const [emergencyContactName, setEmergencyContactName] = useState(member?.emergencyContactName || "")
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(member?.emergencyContactPhone || "")
  const [notes, setNotes] = useState(member?.notes || "")
  const [color, setColor] = useState(member?.color || AVATAR_COLORS[0].value)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim() || !email.trim()) {
      setError("Name and email are required")
      return
    }

    setIsSubmitting(true)

    const input: AddStaffInput = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      role,
      contractType,
      startDate: startDate || undefined,
      address: address.trim() || undefined,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      notes: notes.trim() || undefined,
      color,
    }

    let success: boolean

    if (isEditing) {
      success = await updateStaff(member.id, input)
    } else {
      const result = await addStaff(input)
      success = result.success
      if (!success && result.error) setError(result.error)
    }

    setIsSubmitting(false)

    if (success) {
      onSuccess()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-[#0F1117] rounded-lg border border-gray-800 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0F1117] border-b border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? "Edit Staff Member" : "Add Staff Member"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-900/20 border border-red-600 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Name and Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-gray-600 text-white text-sm focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-gray-600 text-white text-sm focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-gray-600 text-white text-sm focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Role and Contract */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-gray-600 text-white text-sm focus:border-green-500 focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Contract Type</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-gray-600 text-white text-sm focus:border-green-500 focus:outline-none"
              >
                {CONTRACT_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-gray-600 text-white text-sm focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-gray-600 text-white text-sm focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Emergency Contact Name</label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-gray-600 text-white text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Emergency Contact Phone</label>
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-gray-600 text-white text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded bg-[#1A1A2E] border border-gray-600 text-white text-sm focus:border-green-500 focus:outline-none resize-none"
            />
          </div>

          {/* Avatar Color */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Avatar Color</label>
            <div className="flex gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-[#0F1117]" : ""
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: "#2C5F2E" }}
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Staff Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
