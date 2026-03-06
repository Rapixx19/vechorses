/**
 * FILE: lib/context/AuthContext.tsx
 * ZONE: Yellow
 * PURPOSE: React context for auth state management (mock for V1)
 * EXPORTS: AuthProvider, AuthContext
 * DEPENDS ON: lib/types.ts, lib/mock/auth.ts, lib/mock/team.ts
 * CONSUMED BY: app/layout.tsx, lib/hooks/useAuth.ts
 * TESTS: lib/context/AuthContext.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for auth system
 */

"use client"

import { createContext, useState, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { AuthUser } from "@/lib/types"
import { mockAuthUser, mockTeamMembers } from "@/lib/mock"

interface AuthContextType {
  currentUser: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

// BREADCRUMB: V1 mock auth - any email with @ works, sets mockAuthUser
// V2 will replace with Supabase auth, only this file changes
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(mockAuthUser)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 500)) // Simulate network delay

    if (!email.includes("@")) {
      setIsLoading(false)
      throw new Error("Invalid credentials")
    }

    // Mock: find user by email or default to owner
    const member = mockTeamMembers.find((m) => m.email === email)
    const user: AuthUser = member
      ? { id: member.id, fullName: member.fullName, email: member.email, role: member.role, permissions: member.permissions }
      : mockAuthUser

    setCurrentUser(user)
    setIsLoading(false)
    router.push("/dashboard")
  }, [router])

  const logout = useCallback(() => {
    setCurrentUser(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
