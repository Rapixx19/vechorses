/**
 * FILE: lib/supabase.ts
 * ZONE: 🔴 Red — critical infrastructure
 * PURPOSE: Supabase browser client factory with build-time safety
 * EXPORTS: createClient
 * DEPENDS ON: .env.local, @supabase/ssr
 * CONSUMED BY: All V2 hooks (client-side), AuthContext
 * TESTS: lib/supabase.test.ts
 * LAST CHANGED: 2026-03-06 — Added build-time mock for static prerender
 */

import { createBrowserClient } from "@supabase/ssr"

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return mock client during static build
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: null, error: new Error("No client") }),
        signUp: async () => ({ data: null, error: new Error("No client") }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: async () => ({ data: null, error: null }) }),
        upsert: async () => ({ error: null }),
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
  }

  return createBrowserClient(url, key)
}
