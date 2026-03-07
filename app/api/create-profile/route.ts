/**
 * FILE: app/api/create-profile/route.ts
 * ZONE: Yellow
 * PURPOSE: API route to create profile using service role (bypasses RLS)
 * EXPORTS: POST
 * DEPENDS ON: @supabase/supabase-js
 * CONSUMED BY: AuthContext fetchUserProfile()
 * TESTS: None
 * LAST CHANGED: 2026-03-07 — Initial creation for profile auto-creation
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
  const { userId, email, fullName } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  // Check if stable exists for this user
  const { data: stable } = await supabaseAdmin
    .from("stables")
    .select("id, stable_name")
    .eq("owner_user_id", userId)
    .single()

  const defaultPermissions = getDefaultPermissions("owner")

  const { error } = await supabaseAdmin.from("profiles").upsert({
    id: userId,
    full_name: fullName || email || "User",
    stable_id: stable?.id || null,
    role: "owner",
    permissions: defaultPermissions,
  })

  if (error) {
    console.error("Profile creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    stableId: stable?.id || null,
    stableName: stable?.stable_name || null,
  })
}
