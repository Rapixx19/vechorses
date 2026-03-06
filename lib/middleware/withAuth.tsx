/**
 * FILE: lib/middleware/withAuth.tsx
 * ZONE: Yellow
 * PURPOSE: HOC for route protection and permission checking
 * EXPORTS: withAuth
 * DEPENDS ON: lib/hooks/useAuth.ts, components/ui/AccessDenied
 * CONSUMED BY: Protected pages
 * TESTS: lib/middleware/withAuth.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for auth system
 */

"use client"

import { useEffect, type ComponentType } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useHasPermission } from "@/lib/hooks/useAuth"
import { AccessDenied } from "@/components/ui/AccessDenied"
import type { ModuleName } from "@/lib/types"

interface WithAuthOptions {
  module?: ModuleName
}

// BREADCRUMB: Wraps pages to require auth and optionally check module permission
export function withAuth<P extends object>(Component: ComponentType<P>, options?: WithAuthOptions) {
  return function ProtectedPage(props: P) {
    const router = useRouter()
    const { currentUser } = useAuth()
    const hasPermission = useHasPermission(options?.module || "dashboard", "view")

    useEffect(() => {
      if (!currentUser) router.push("/login")
    }, [currentUser, router])

    if (!currentUser) return null
    if (options?.module && !hasPermission) return <AccessDenied />

    return <Component {...props} />
  }
}
