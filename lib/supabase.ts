/**
 * FILE: lib/supabase.ts
 * ZONE: 🔴 Red — critical infrastructure
 * PURPOSE: Supabase browser client factory with build-time safety
 * EXPORTS: createClient
 * DEPENDS ON: .env.local, @supabase/ssr
 * CONSUMED BY: All V2 hooks (client-side), AuthContext
 * TESTS: lib/supabase.test.ts
 * LAST CHANGED: 2026-03-06 — Added debug logging for env var issues
 */

import { createBrowserClient } from "@supabase/ssr"

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Debug logging for production issues
  if (typeof window !== "undefined") {
    console.log("Supabase client init:", { hasUrl: !!url, hasKey: !!key })
  }

  if (!url || !key) {
    // During SSR/static build, return mock client
    // At runtime, this should never happen if env vars are set correctly
    if (typeof window !== "undefined") {
      console.error("MISSING SUPABASE ENV VARS - check Vercel environment variables", {
        url: !!url,
        key: !!key,
      })
    }

    // Return mock client that won't crash but will fail auth operations
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: { message: "Supabase not configured - check environment variables" },
        }),
        signUp: async () => ({
          data: { user: null, session: null },
          error: { message: "Supabase not configured - check environment variables" },
        }),
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
