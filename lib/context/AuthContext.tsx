/**
 * FILE: lib/context/AuthContext.tsx
 * ZONE: 🔴 Red — critical auth infrastructure
 * PURPOSE: React context for auth state management (V1: mock, V2: Supabase)
 * EXPORTS: AuthProvider, AuthContext
 * DEPENDS ON: lib/types.ts, lib/mock/auth.ts
 * CONSUMED BY: app/layout.tsx, lib/hooks/useAuth.ts
 * TESTS: lib/context/AuthContext.test.tsx
 * LAST CHANGED: 2026-03-06 — V1 mock auth (always logged in)
 */

"use client"

import { createContext, useState, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { mockAuthUser } from "@/lib/mock"
import type { AuthUser } from "@/lib/types"

interface AuthContextType {
  currentUser: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (fullName: string, email: string, password: string, stableName: string) => Promise<void>
  joinWithCode: (code: string, fullName: string, email: string, password: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // V1: Always start with mockAuthUser (no real auth)
  // V2: Replace with Supabase session check
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(mockAuthUser)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // V1: Mock login — just redirect to dashboard
  // V2: Replace with supabase.auth.signInWithPassword
  const login = useCallback(async (_email: string, _password: string) => {
    setIsLoading(true)
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    setCurrentUser(mockAuthUser)
    setIsLoading(false)
    router.push("/dashboard")
  }, [router])

  // V1: Mock logout — reset to mockAuthUser (stay "logged in" for demo)
  // V2: Replace with supabase.auth.signOut and set null
  const logout = useCallback(() => {
    // V1: Keep user logged in with mock data for demo purposes
    // V2: setCurrentUser(null) and redirect to /login
    setCurrentUser(mockAuthUser)
    router.push("/login")
  }, [router])

  // V1: Mock register — just redirect to dashboard
  // V2: Replace with supabase.auth.signUp
  const register = useCallback(async (_fullName: string, _email: string, _password: string, _stableName: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setCurrentUser(mockAuthUser)
    setIsLoading(false)
    router.push("/dashboard")
  }, [router])

  // V1: Mock join — just redirect to dashboard
  // V2: Replace with Supabase referral code lookup and signup
  const joinWithCode = useCallback(async (_code: string, _fullName: string, _email: string, _password: string) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setCurrentUser(mockAuthUser)
    setIsLoading(false)
    router.push("/dashboard")
  }, [router])

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, register, joinWithCode }}>
      {children}
    </AuthContext.Provider>
  )
}
