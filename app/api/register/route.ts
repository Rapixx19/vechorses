/**
 * FILE: app/api/register/route.ts
 * ZONE: Yellow
 * PURPOSE: API route to create stable and profile after signup (uses service role)
 * EXPORTS: POST
 * DEPENDS ON: @supabase/supabase-js
 * CONSUMED BY: AuthContext register()
 * TESTS: None
 * LAST CHANGED: 2026-03-07 — Use service role client to bypass RLS
 */

import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { getDefaultPermissions } from "@/lib/mock"

// Lazy init to avoid build-time errors when env vars not available
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const { userId, fullName, stableName } = await request.json()

  if (!userId || !stableName) {
    return NextResponse.json({ error: "userId and stableName are required" }, { status: 400 })
  }

  const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase()

  // Create stable
  const { data: stable, error: stableError } = await supabaseAdmin
    .from("stables")
    .insert({
      stable_name: stableName,
      owner_user_id: userId,
      referral_code: referralCode,
    })
    .select()
    .single()

  if (stableError) {
    console.error("Stable creation error:", stableError)
    return NextResponse.json({ error: stableError.message }, { status: 400 })
  }

  // Create profile linked to stable
  const defaultPermissions = getDefaultPermissions("owner")

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    stable_id: stable.id,
    role: "owner",
    permissions: defaultPermissions,
  })

  if (profileError) {
    console.error("Profile creation error:", profileError)
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({
    referralCode,
    stableId: stable.id,
  })
}
