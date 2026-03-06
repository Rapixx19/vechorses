/**
 * FILE: lib/middleware/withAuth.tsx
 * ZONE: Yellow
 * PURPOSE: HOC for route protection and permission checking
 * EXPORTS: withAuth
 * DEPENDS ON: lib/hooks/useAuth.ts, components/ui/AccessDenied
 * CONSUMED BY: Protected pages
 * TESTS: lib/middleware/withAuth.test.tsx
 * LAST CHANGED: 2026-03-06 — V1 simplified (always allows access)
 */

"use client"

import { type ComponentType } from "react"
import { useAuth, useHasPermission } from "@/lib/hooks/useAuth"
import { AccessDenied } from "@/components/ui/AccessDenied"
import type { ModuleName } from "@/lib/types"

interface WithAuthOptions {
  module?: ModuleName
}

// BREADCRUMB: Wraps pages to require auth and optionally check module permission
// V1: Always allows access (mockAuthUser is always set)
// V2: Add real auth check with redirect to /login
export function withAuth<P extends object>(Component: ComponentType<P>, options?: WithAuthOptions) {
  return function ProtectedPage(props: P) {
    const { currentUser } = useAuth()
    const hasPermission = useHasPermission(options?.module || "dashboard", "view")

    // V1: currentUser is always mockAuthUser, so this never triggers
    // V2: Add useEffect to redirect to /login when !currentUser
    if (!currentUser) return null

    if (options?.module && !hasPermission) return <AccessDenied />

    return <Component {...props} />
  }
}
