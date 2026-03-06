/**
 * FILE: components/layout/AuthLayout.tsx
 * ZONE: Green
 * PURPOSE: Client-side layout wrapper with auth-aware routing
 * EXPORTS: AuthLayout
 * DEPENDS ON: lib/context/AuthContext, AppShell
 * CONSUMED BY: app/layout.tsx
 * TESTS: components/layout/AuthLayout.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for auth system
 */

"use client"

import { usePathname } from "next/navigation"
import { AuthProvider } from "@/lib/context/AuthContext"
import { AppShell } from "./AppShell"

interface AuthLayoutProps {
  children: React.ReactNode
}

// BREADCRUMB: Wraps app in AuthProvider, hides AppShell on login page
// V2: Add real auth protection here (redirect unauthenticated users to /login)
export function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  return (
    <AuthProvider>
      {isLoginPage ? children : <AppShell>{children}</AppShell>}
    </AuthProvider>
  )
}
