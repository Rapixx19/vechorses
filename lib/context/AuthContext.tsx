/**
 * FILE: lib/context/AuthContext.tsx
 * ZONE: 🔴 Red — critical auth infrastructure
 * PURPOSE: React context for Supabase auth state management
 * EXPORTS: AuthProvider, AuthContext
 * DEPENDS ON: lib/types.ts, lib/supabase.ts, lib/mock
 * CONSUMED BY: app/layout.tsx, lib/hooks/useAuth.ts
 * TESTS: lib/context/AuthContext.test.tsx
 * LAST CHANGED: 2026-03-08 — Fix double login bug with proper auth flow
 */

"use client"

import { createContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react"
import { createClient } from "@/lib/supabase"
import { getDefaultPermissions } from "@/lib/mock"
import type { AuthUser, ModulePermission } from "@/lib/types"

interface AuthContextType {
  currentUser: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>
  logout: () => void
  register: (fullName: string, email: string, password: string, stableName: string) => Promise<void>
  joinWithCode: (code: string, fullName: string, email: string, password: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

// BREADCRUMB: Fetches profile and builds AuthUser from Supabase data
async function fetchUserProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  userEmail?: string
): Promise<AuthUser | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  // If profile not found, create via API route (service role bypasses RLS)
  if (error || !data) {
    console.log("Profile not found, creating via API for:", userId)
    const defaultPermissions = getDefaultPermissions("owner")

    try {
      const res = await fetch("/api/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email: userEmail,
          fullName: userEmail || "User",
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        console.error("Failed to create profile:", result.error)
      }

      return {
        id: userId,
        fullName: userEmail || "User",
        email: userEmail || "",
        role: "owner",
        permissions: defaultPermissions,
        stableId: result.stableId || undefined,
        stableName: result.stableName || undefined,
      }
    } catch (err) {
      console.error("Profile creation API error:", err)
      return {
        id: userId,
        fullName: userEmail || "User",
        email: userEmail || "",
        role: "owner",
        permissions: defaultPermissions,
        stableId: undefined,
        stableName: undefined,
      }
    }
  }

  // Profile exists - check if stable_id is missing but user owns a stable
  let stableId = data.stable_id
  let stableName: string | undefined

  if (!stableId) {
    console.log("Profile has no stable_id, checking for owned stable...")
    const { data: ownedStable } = await supabase
      .from("stables")
      .select("id, stable_name")
      .eq("owner_user_id", userId)
      .maybeSingle()

    if (ownedStable) {
      console.log("Found owned stable, linking to profile:", ownedStable.id)
      stableId = ownedStable.id
      stableName = ownedStable.stable_name

      // Update profile with stable_id
      await supabase.from("profiles").update({ stable_id: stableId }).eq("id", userId)
    }
  } else {
    // Fetch stable name for display
    const { data: stable } = await supabase.from("stables").select("stable_name").eq("id", stableId).maybeSingle()
    stableName = stable?.stable_name
  }

  const { data: authData } = await supabase.auth.getUser()
  return {
    id: data.id,
    fullName: data.full_name || "",
    email: authData.user?.email || "",
    role: data.role || "staff",
    permissions: (data.permissions as ModulePermission[]) || [],
    stableId,
    stableName,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // BREADCRUMB: Singleton supabase client
  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch (e) {
      console.error("Supabase client error:", e)
      return null
    }
  }, [])

  // BREADCRUMB: Initialize auth state on mount - fixed race condition
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    let mounted = true

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (session?.user) {
          const profile = await fetchUserProfile(supabase, session.user.id, session.user.email)
          if (mounted) {
            setCurrentUser(profile)
            setIsLoading(false)
          }
        } else {
          setCurrentUser(null)
          setIsLoading(false)
        }
      } catch (e) {
        console.error("Auth init error:", e)
        if (mounted) {
          setCurrentUser(null)
          setIsLoading(false)
        }
      }
    }

    initAuth()

    // BREADCRUMB: Listen for auth changes but ignore INITIAL_SESSION
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // Ignore initial session - already handled by initAuth
      if (event === "INITIAL_SESSION") return

      // Ignore token refresh - silent operation
      if (event === "TOKEN_REFRESHED") return

      if (event === "SIGNED_OUT") {
        setCurrentUser(null)
        setIsLoading(false)
      }

      // SIGNED_IN is handled by login function directly
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  // BREADCRUMB: Login function - returns error instead of throwing
  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = false): Promise<{ error: Error | null }> => {
      if (!supabase) return { error: new Error("Supabase client not available") }

      try {
        setIsLoading(true)

        // Store remember me preference
        if (typeof window !== "undefined") {
          if (rememberMe) {
            localStorage.setItem("vechorses-email", email)
          } else {
            localStorage.removeItem("vechorses-email")
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setIsLoading(false)
          return { error: new Error(error.message) }
        }

        if (data.user && data.session) {
          const profile = await fetchUserProfile(supabase, data.user.id, data.user.email)
          setCurrentUser(profile)
          setIsLoading(false)
          return { error: null }
        }

        setIsLoading(false)
        return { error: new Error("No session returned") }
      } catch (err) {
        setIsLoading(false)
        return { error: err instanceof Error ? err : new Error("Login failed") }
      }
    },
    [supabase]
  )

  const logout = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setCurrentUser(null)
    // Use hard navigation to clear all state
    window.location.href = "/login"
  }, [supabase])

  const register = useCallback(
    async (fullName: string, email: string, password: string, stableName: string) => {
      if (!supabase) throw new Error("Supabase client not available")
      setIsLoading(true)

      try {
        // Step 1: Create auth user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })

        if (signUpError) {
          throw signUpError
        }
        if (!authData.user) {
          throw new Error("No user returned from signup")
        }

        // Step 2: Create stable and profile via API route (handles RLS)
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: authData.user.id,
            fullName,
            stableName,
            email,
          }),
        })

        const result = await res.json()

        if (!res.ok) {
          throw new Error(result.error || "Failed to create stable")
        }

        // Step 3: Set current user immediately
        setCurrentUser({
          id: authData.user.id,
          fullName,
          email,
          role: "owner",
          permissions: getDefaultPermissions("owner"),
          stableId: result.stableId || "",
          stableName: stableName,
        })

        setIsLoading(false)
        // BREADCRUMB: Redirect to onboarding for new stable owners
        window.location.href = "/onboarding"
      } catch (error) {
        console.error("Registration error:", error)
        setIsLoading(false)
        throw error
      }
    },
    [supabase]
  )

  const joinWithCode = useCallback(
    async (code: string, fullName: string, email: string, password: string) => {
      if (!supabase) throw new Error("Supabase client not available")
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
      window.location.href = "/dashboard"
    },
    [supabase]
  )

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, register, joinWithCode }}>
      {children}
    </AuthContext.Provider>
  )
}
