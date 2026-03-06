/**
 * FILE: app/api/join/route.ts
 * ZONE: Yellow
 * PURPOSE: API route to join a stable with referral code after signup
 * EXPORTS: POST
 * DEPENDS ON: lib/supabaseServer.ts
 * CONSUMED BY: AuthContext joinWithCode()
 * TESTS: None
 * LAST CHANGED: 2026-03-06 — Initial creation for join flow
 */

import { createServerSupabaseClient } from "@/lib/supabaseServer"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { userId, fullName, email, code } = await request.json()

  const supabase = await createServerSupabaseClient()

  // Find stable by referral code
  const { data: stable, error: stableError } = await supabase
    .from("stables")
    .select("id")
    .eq("referral_code", code.toUpperCase())
    .single()

  if (stableError || !stable) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
  }

  // Update profile with stable_id and role
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    stable_id: stable.id,
    role: "staff",
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  // Add to team_members
  const { error: teamError } = await supabase.from("team_members").insert({
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
