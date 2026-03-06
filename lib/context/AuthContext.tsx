/**
 * FILE: lib/context/AuthContext.tsx
 * ZONE: 🔴 Red — critical auth infrastructure
 * PURPOSE: React context for Supabase auth state management
 * EXPORTS: AuthProvider, AuthContext
 * DEPENDS ON: lib/types.ts, lib/supabase.ts, lib/mock
 * CONSUMED BY: app/layout.tsx, lib/hooks/useAuth.ts
 * TESTS: lib/context/AuthContext.test.tsx
 * LAST CHANGED: 2026-03-06 — Fixed infinite loop, auto-create profile
 */

"use client"

import { createContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { getDefaultPermissions } from "@/lib/mock"
import type { AuthUser, ModulePermission } from "@/lib/types"

interface AuthContextType {
  currentUser: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (fullName: string, email: string, password: string, stableName: string) => Promise<void>
  joinWithCode: (code: string, fullName: string, email: string, password: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

// Fetches profile and builds AuthUser from Supabase data
// If profile doesn't exist, creates a basic one on the fly
async function fetchUserProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  userEmail?: string
): Promise<AuthUser | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  // If profile not found, create a basic one
  if (error || !data) {
    console.log("Profile not found, creating basic profile for:", userId)
    const defaultPermissions = getDefaultPermissions("owner")

    await supabase.from("profiles").upsert({
      id: userId,
      full_name: userEmail || "User",
      role: "owner",
      permissions: defaultPermissions,
    })

    return {
      id: userId,
      fullName: userEmail || "User",
      email: userEmail || "",
      role: "owner",
      permissions: defaultPermissions,
      stableId: undefined,
    }
  }

  const { data: authData } = await supabase.auth.getUser()
  return {
    id: data.id,
    fullName: data.full_name || "",
    email: authData.user?.email || "",
    role: data.role || "staff",
    permissions: (data.permissions as ModulePermission[]) || [],
    stableId: data.stable_id,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Memoize supabase client to prevent infinite re-renders
  const supabase = useMemo(() => createClient(), [])

  // Restore session on mount and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then((response: { data: { session: { user: { id: string; email?: string } } | null } }) => {
      const session = response.data.session
      if (session?.user) {
        fetchUserProfile(supabase, session.user.id, session.user.email).then(setCurrentUser)
      }
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: { user: { id: string; email?: string } } | null) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchUserProfile(supabase, session.user.id, session.user.email)
        setCurrentUser(profile)
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setIsLoading(false)
      if (error) throw new Error(error.message)
      router.push("/dashboard")
    },
    [supabase, router]
  )

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    router.push("/login")
  }, [supabase, router])

  const register = useCallback(
    async (fullName: string, email: string, password: string, stableName: string) => {
      setIsLoading(true)

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })

      if (authError || !authData.user) {
        setIsLoading(false)
        throw new Error(authError?.message || "Registration failed")
      }

      // Step 2: Create stable and profile via API route (handles RLS)
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authData.user.id,
          fullName,
          stableName,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setIsLoading(false)
        throw new Error(result.error || "Failed to create stable")
      }

      setIsLoading(false)
      router.push("/dashboard")
    },
    [supabase, router]
  )

  const joinWithCode = useCallback(
    async (code: string, fullName: string, email: string, password: string) => {
      setIsLoading(true)

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })

      if (authError || !authData.user) {
        setIsLoading(false)
        throw new Error(authError?.message || "Registration failed")
      }

      // Step 2: Join stable via API route (handles RLS and validates code)
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authData.user.id,
          fullName,
          email,
          code,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setIsLoading(false)
        throw new Error(result.error || "Failed to join stable")
      }

      setIsLoading(false)
      router.push("/dashboard")
    },
    [supabase, router]
  )

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, register, joinWithCode }}>
      {children}
    </AuthContext.Provider>
  )
}
