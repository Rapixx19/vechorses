/**
 * FILE: app/api/register/route.ts
 * ZONE: Yellow
 * PURPOSE: API route to create stable and profile after signup
 * EXPORTS: POST
 * DEPENDS ON: lib/supabaseServer.ts
 * CONSUMED BY: AuthContext register()
 * TESTS: None
 * LAST CHANGED: 2026-03-06 — Initial creation for registration flow
 */

import { createServerSupabaseClient } from "@/lib/supabaseServer"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { userId, fullName, stableName } = await request.json()

  const supabase = await createServerSupabaseClient()

  const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase()

  const { data: stable, error: stableError } = await supabase
    .from("stables")
    .insert({
      stable_name: stableName,
      owner_user_id: userId,
      referral_code: referralCode,
    })
    .select()
    .single()

  if (stableError) {
    return NextResponse.json({ error: stableError.message }, { status: 400 })
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    stable_id: stable.id,
    role: "owner",
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({
    referralCode,
    stableId: stable.id,
  })
}
