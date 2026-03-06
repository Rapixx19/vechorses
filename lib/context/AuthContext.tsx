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

const generateReferralCode = () => Math.random().toString(36).substring(2, 10).toUpperCase()

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
      setIsLoading(true)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (authError || !authData.user) {
        setIsLoading(false)
        throw new Error(authError?.message || "Registration failed")
      }

      const referralCode = generateReferralCode()
      const { data: stable, error: stableError } = await supabase
        .from("stables")
        .insert({ stable_name: stableName, referral_code: referralCode, owner_user_id: authData.user.id })
        .select()
        .single()
      if (stableError) {
        setIsLoading(false)
        throw new Error(stableError.message)
      }

      await supabase.from("profiles").update({ stable_id: stable.id, role: "owner" }).eq("id", authData.user.id)
      setIsLoading(false)
      router.push("/dashboard")
    },
    [supabase, router]
  )

  const joinWithCode = useCallback(
    async (code: string, fullName: string, email: string, password: string) => {
      setIsLoading(true)
      const { data: stable, error: stableError } = await supabase
        .from("stables")
        .select("id")
        .eq("referral_code", code.toUpperCase())
        .single()
      if (stableError || !stable) {
        setIsLoading(false)
        throw new Error("Invalid referral code")
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (authError || !authData.user) {
        setIsLoading(false)
        throw new Error(authError?.message || "Registration failed")
      }

      await supabase.from("profiles").update({ stable_id: stable.id, role: "staff" }).eq("id", authData.user.id)
      await supabase
        .from("team_members")
        .insert({ stable_id: stable.id, full_name: fullName, email, role: "staff", status: "pending" })
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
