/**
 * FILE: lib/context/AuthContext.tsx
 * ZONE: 🔴 Red — critical auth infrastructure
 * PURPOSE: React context for Supabase auth state management
 * EXPORTS: AuthProvider, AuthContext
 * DEPENDS ON: lib/types.ts, lib/supabase.ts
 * CONSUMED BY: app/layout.tsx, lib/hooks/useAuth.ts
 * TESTS: lib/context/AuthContext.test.tsx
 * LAST CHANGED: 2026-03-06 — V2 real Supabase auth
 */

"use client"

import { createContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
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
async function fetchUserProfile(supabase: ReturnType<typeof createClient>, userId: string): Promise<AuthUser | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single()
  if (!data) return null
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
  const supabase = createClient()

  // Restore session on mount and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then((response: { data: { session: { user: { id: string } } | null } }) => {
      const session = response.data.session
      if (session?.user) {
        fetchUserProfile(supabase, session.user.id).then(setCurrentUser)
      }
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: { user: { id: string } } | null) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchUserProfile(supabase, session.user.id)
        setCurrentUser(profile)
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const login = useCallback(
    async (email: string, password: string) => {
      console.log("Attempting login with:", email)
      console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      console.log("Login result:", { data, error })
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
      console.log("Attempting registration for:", email)
      setIsLoading(true)

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      console.log("SignUp result:", { user: authData?.user?.id, error: authError })

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
      console.log("API register result:", result)

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
      console.log("Attempting join with code:", code)
      setIsLoading(true)

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      console.log("SignUp result:", { user: authData?.user?.id, error: authError })

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
      console.log("API join result:", result)

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
