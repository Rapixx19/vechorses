/**
 * FILE: lib/supabaseServer.ts
 * ZONE: 🔴 Red — critical infrastructure
 * PURPOSE: Supabase server client for Server Components and API routes
 * EXPORTS: createServerClient
 * DEPENDS ON: .env.local, @supabase/ssr, next/headers
 * CONSUMED BY: All V2 server-side data fetching
 * TESTS: lib/supabaseServer.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation for V2 backend
 */

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// BREADCRUMB: Fallback to placeholder values during static prerender
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

// BREADCRUMB: Creates a server client with cookie handling for auth
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
      },
    },
  })
}
