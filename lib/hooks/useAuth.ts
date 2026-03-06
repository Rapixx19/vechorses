/**
 * FILE: lib/hooks/useAuth.ts
 * ZONE: Yellow
 * PURPOSE: Auth hook and permission checker
 * EXPORTS: useAuth, useHasPermission
 * DEPENDS ON: lib/context/AuthContext.tsx, lib/types.ts
 * CONSUMED BY: All protected pages, AppShell
 * TESTS: lib/hooks/useAuth.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation for auth system
 */

"use client"

import { useContext } from "react"
import { AuthContext } from "@/lib/context/AuthContext"
import type { ModuleName } from "@/lib/types"

// BREADCRUMB: Main auth hook - throws if used outside AuthProvider
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

type PermissionAction = "view" | "edit" | "delete"

// BREADCRUMB: Permission checker - used throughout app to gate UI elements
export function useHasPermission(module: ModuleName, action: PermissionAction): boolean {
  const { currentUser } = useAuth()
  if (!currentUser) return false

  const perm = currentUser.permissions.find((p) => p.module === module)
  if (!perm) return false

  switch (action) {
    case "view": return perm.canView
    case "edit": return perm.canEdit
    case "delete": return perm.canDelete
    default: return false
  }
}
