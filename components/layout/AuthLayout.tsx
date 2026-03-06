/**
 * FILE: components/layout/AuthLayout.tsx
 * ZONE: Green
 * PURPOSE: Client-side layout wrapper with auth-aware routing and loading state
 * EXPORTS: AuthLayout
 * DEPENDS ON: lib/context/AuthContext, AppShell, lib/hooks/useAuth
 * CONSUMED BY: app/layout.tsx
 * TESTS: components/layout/AuthLayout.test.tsx
 * LAST CHANGED: 2026-03-06 — Added loading state and auth redirect
 */

"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AuthProvider } from "@/lib/context/AuthContext"
import { useAuth } from "@/lib/hooks/useAuth"
import { AppShell } from "./AppShell"

interface AuthLayoutProps {
  children: React.ReactNode
}

const AUTH_PAGES = ["/login", "/register", "/join"]

// Inner component that uses auth context
function AuthLayoutInner({ children }: AuthLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, isLoading } = useAuth()

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page))

  useEffect(() => {
    // Only redirect after loading is complete
    if (!isLoading && !currentUser && !isAuthPage) {
      router.push("/login")
    }
  }, [isLoading, currentUser, isAuthPage, router])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C5F2E]" />
      </div>
    )
  }

  // On auth pages, just render children (no AppShell)
  if (isAuthPage) {
    return <>{children}</>
  }

  // Not logged in and not on auth page - will redirect via useEffect
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C5F2E]" />
      </div>
    )
  }

  // Logged in - show app
  return <AppShell>{children}</AppShell>
}

// Outer component that provides auth context
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthProvider>
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </AuthProvider>
  )
}
