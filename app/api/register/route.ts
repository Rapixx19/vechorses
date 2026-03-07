/**
 * FILE: app/api/register/route.ts
 * ZONE: Yellow
 * PURPOSE: API route to create stable and profile after signup (uses service role)
 * EXPORTS: POST
 * DEPENDS ON: @supabase/supabase-js
 * CONSUMED BY: AuthContext register()
 * TESTS: None
 * LAST CHANGED: 2026-03-07 — Added email to profile, improved error handling
 */

import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const { userId, fullName, stableName, email, country, phone } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email are required" }, { status: 400 })
    }

    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    // Create stable
    const { data: stable, error: stableError } = await supabaseAdmin
      .from("stables")
      .insert({
        stable_name: stableName || "My Stable",
        owner_user_id: userId,
        referral_code: referralCode,
        currency: "EUR",
        country: country || "",
        phone: phone || "",
        email: email || "",
      })
      .select()
      .single()

    if (stableError) {
      console.error("Stable creation error:", stableError)
      return NextResponse.json({ error: stableError.message }, { status: 400 })
    }

    // Upsert profile with email
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: fullName || email,
      email: email,
      stable_id: stable.id,
      role: "owner",
      permissions: [],
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      referralCode,
      stableId: stable.id,
      stableName: stable.stable_name,
    })
  } catch (err) {
    console.error("Register route error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Registration failed" },
      { status: 500 }
    )
  }
}
