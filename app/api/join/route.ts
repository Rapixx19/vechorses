/**
 * FILE: app/api/join/route.ts
 * ZONE: Yellow
 * PURPOSE: API route to join a stable with referral code after signup (uses service role)
 * EXPORTS: POST
 * DEPENDS ON: @supabase/supabase-js
 * CONSUMED BY: AuthContext joinWithCode()
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
  const { userId, fullName, email, code } = await request.json()

  if (!userId || !code) {
    return NextResponse.json({ error: "userId and code are required" }, { status: 400 })
  }

  // Find stable by referral code
  const { data: stable, error: stableError } = await supabaseAdmin
    .from("stables")
    .select("id")
    .eq("referral_code", code.toUpperCase())
    .single()

  if (stableError || !stable) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
  }

  // Create profile with stable_id and staff role
  const defaultPermissions = getDefaultPermissions("staff")

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    stable_id: stable.id,
    role: "staff",
    permissions: defaultPermissions,
  })

  if (profileError) {
    console.error("Profile creation error:", profileError)
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  // Add to team_members
  const { error: teamError } = await supabaseAdmin.from("team_members").insert({
    stable_id: stable.id,
    full_name: fullName,
    email,
    role: "staff",
    status: "pending",
  })

  if (teamError) {
    console.error("Team member insert error:", teamError)
    // Don't fail the request, profile is already created
  }

  return NextResponse.json({ stableId: stable.id })
}
