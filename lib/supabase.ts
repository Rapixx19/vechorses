/**
 * FILE: lib/supabase.ts
 * ZONE: 🔴 Red — critical infrastructure
 * PURPOSE: Supabase browser client singleton
 * EXPORTS: supabase
 * DEPENDS ON: .env.local, @supabase/ssr
 * CONSUMED BY: All V2 hooks (client-side)
 * TESTS: lib/supabase.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation for V2 backend
 */

import { createBrowserClient } from "@supabase/ssr"

// BREADCRUMB: Fallback to empty strings during static prerender
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl) console.warn("Missing NEXT_PUBLIC_SUPABASE_URL")
if (!supabaseAnonKey) console.warn("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY")

// BREADCRUMB: Browser client for use in Client Components
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
