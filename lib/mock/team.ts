/**
 * FILE: lib/mock/team.ts
 * ZONE: Yellow
 * PURPOSE: Mock team members for V1 auth system
 * EXPORTS: mockTeamMembers, getDefaultPermissions
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: lib/mock/index.ts, modules/settings/hooks/useTeam
 * TESTS: lib/mock/team.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation for auth system
 */

import type { TeamMember, ModulePermission, UserRole, ModuleName } from "@/lib/types"

const modules: ModuleName[] = ["dashboard", "horses", "clients", "stalls", "billing", "services", "settings"]

// BREADCRUMB: Default permissions per role - used when inviting new members
export function getDefaultPermissions(role: UserRole): ModulePermission[] {
  if (role === "owner") {
    return modules.map((m) => ({ module: m, canView: true, canEdit: true, canDelete: true }))
  }
  if (role === "manager") {
    return [
      { module: "dashboard", canView: true, canEdit: false, canDelete: false },
      { module: "horses", canView: true, canEdit: true, canDelete: false },
      { module: "clients", canView: true, canEdit: true, canDelete: false },
      { module: "stalls", canView: true, canEdit: true, canDelete: false },
      { module: "billing", canView: true, canEdit: true, canDelete: false },
      { module: "services", canView: true, canEdit: false, canDelete: false },
      { module: "settings", canView: false, canEdit: false, canDelete: false },
    ]
  }
  if (role === "staff") {
    return [
      { module: "dashboard", canView: true, canEdit: false, canDelete: false },
      { module: "horses", canView: true, canEdit: false, canDelete: false },
      { module: "clients", canView: false, canEdit: false, canDelete: false },
      { module: "stalls", canView: true, canEdit: true, canDelete: false },
      { module: "billing", canView: false, canEdit: false, canDelete: false },
      { module: "services", canView: false, canEdit: false, canDelete: false },
      { module: "settings", canView: false, canEdit: false, canDelete: false },
    ]
  }
  // custom role starts with no permissions
  return modules.map((m) => ({ module: m, canView: false, canEdit: false, canDelete: false }))
}

export const mockTeamMembers: TeamMember[] = [
  {
    id: "user-001",
    fullName: "Roberto Marchetti",
    email: "roberto@scuderiavv.it",
    role: "owner",
    permissions: getDefaultPermissions("owner"),
    isActive: true,
    invitedAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2026-03-06T08:30:00Z",
  },
  {
    id: "user-002",
    fullName: "Giulia Ferri",
    email: "giulia@scuderiavv.it",
    role: "manager",
    permissions: getDefaultPermissions("manager"),
    isActive: true,
    invitedAt: "2024-06-15T00:00:00Z",
    lastLoginAt: "2026-03-05T14:20:00Z",
  },
  {
    id: "user-003",
    fullName: "Marco Bianchi",
    email: "marco@scuderiavv.it",
    role: "manager",
    permissions: getDefaultPermissions("manager"),
    isActive: true,
    invitedAt: "2025-02-01T00:00:00Z",
    lastLoginAt: "2026-03-04T09:45:00Z",
  },
  {
    id: "user-004",
    fullName: "Elena Rossi",
    email: "elena@scuderiavv.it",
    role: "staff",
    permissions: getDefaultPermissions("staff"),
    isActive: true,
    invitedAt: "2025-08-10T00:00:00Z",
    lastLoginAt: "2026-03-06T06:15:00Z",
  },
  {
    id: "user-005",
    fullName: "Luca Conti",
    email: "luca@scuderiavv.it",
    role: "staff",
    permissions: getDefaultPermissions("staff"),
    isActive: true,
    invitedAt: "2025-11-20T00:00:00Z",
    lastLoginAt: "2026-03-03T16:00:00Z",
  },
]
