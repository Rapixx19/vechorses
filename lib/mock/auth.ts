/**
 * FILE: lib/mock/auth.ts
 * ZONE: Yellow
 * PURPOSE: Mock authenticated user for V1 (owner by default)
 * EXPORTS: mockAuthUser
 * DEPENDS ON: lib/types.ts, lib/mock/team.ts
 * CONSUMED BY: lib/mock/index.ts, lib/context/AuthContext
 * TESTS: lib/mock/auth.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation for auth system
 */

import type { AuthUser } from "@/lib/types"
import { mockTeamMembers } from "./team"

// BREADCRUMB: Default logged-in user for V1 is the owner
// In V2 this will be replaced by Supabase auth session
const owner = mockTeamMembers.find((m) => m.role === "owner")!

export const mockAuthUser: AuthUser = {
  id: owner.id,
  fullName: owner.fullName,
  email: owner.email,
  role: owner.role,
  permissions: owner.permissions,
}
