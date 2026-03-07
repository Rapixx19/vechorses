/**
 * FILE: lib/supabase.ts
 * ZONE: 🔴 Red — critical infrastructure
 * PURPOSE: Supabase browser client factory with Chrome-compatible storage
 * EXPORTS: createClient
 * DEPENDS ON: .env.local, @supabase/supabase-js
 * CONSUMED BY: All V2 hooks (client-side), AuthContext
 * TESTS: lib/supabase.test.ts
 * LAST CHANGED: 2026-03-07 — Switched from @supabase/ssr to @supabase/supabase-js for Chrome compatibility
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Singleton client instance
let client: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  // Return existing client if already initialized
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During SSR/static build or if env vars missing, return placeholder client
  if (!url || !key || url === "https://placeholder.supabase.co") {
    if (typeof window !== "undefined") {
      console.error("MISSING SUPABASE ENV VARS - check Vercel environment variables", {
        url: !!url,
        key: !!key,
      })
    }
    return createSupabaseClient("https://placeholder.supabase.co", "placeholder-key")
  }

  // Create client with Chrome-compatible auth settings
  client = createSupabaseClient(url, key, {
    auth: {
      persistSession: true,
      storageKey: "vechorses-auth",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return client
}
