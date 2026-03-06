/**
 * FILE: lib/supabaseServer.ts
 * ZONE: 🔴 Red — critical infrastructure
 * PURPOSE: Supabase server client for Server Components and API routes
 * EXPORTS: createServerSupabaseClient
 * DEPENDS ON: .env.local, @supabase/ssr, next/headers
 * CONSUMED BY: All V2 server-side data fetching
 * TESTS: lib/supabaseServer.test.ts
 * LAST CHANGED: 2026-03-06 — V2 real Supabase auth
 */

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  )
}
