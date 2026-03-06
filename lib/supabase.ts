/**
 * FILE: lib/supabase.ts
 * ZONE: 🔴 Red — critical infrastructure
 * PURPOSE: Supabase browser client factory
 * EXPORTS: createClient
 * DEPENDS ON: .env.local, @supabase/ssr
 * CONSUMED BY: All V2 hooks (client-side), AuthContext
 * TESTS: lib/supabase.test.ts
 * LAST CHANGED: 2026-03-06 — V2 real Supabase auth
 */

import { createBrowserClient } from "@supabase/ssr"

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
