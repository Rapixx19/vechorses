/**
 * FILE: app/api/health/route.ts
 * ZONE: Yellow
 * PURPOSE: Health check endpoint for debugging env vars on Vercel
 * EXPORTS: GET
 * DEPENDS ON: None
 * CONSUMED BY: Debug/monitoring
 * TESTS: None
 * LAST CHANGED: 2026-03-06 — Initial creation for debugging
 */

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    },
  })
}
