/**
 * FILE: app/api/health/route.ts
 * ZONE: Yellow
 * PURPOSE: Comprehensive health check endpoint for system status monitoring
 * EXPORTS: GET
 * DEPENDS ON: @supabase/supabase-js
 * CONSUMED BY: Debug/monitoring, Vercel health checks
 * TESTS: None
 * LAST CHANGED: 2026-03-14 — Full system status checks
 */

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

interface HealthCheck {
  timestamp: string
  status: "ok" | "degraded" | "error"
  version: string
  environment: string
  checks: {
    supabase: boolean
    anthropic: boolean
    resend: boolean
    openai: boolean
    whatsapp: boolean
  }
  routes: {
    dashboard: boolean
    horses: boolean
    clients: boolean
    stalls: boolean
    billing: boolean
    calendar: boolean
    staff: boolean
    services: boolean
    documents: boolean
    assistant: boolean
    analytics: boolean
    settings: boolean
    onboarding: boolean
  }
  latency?: {
    supabase?: number
  }
}

export async function GET() {
  const startTime = Date.now()

  const checks: HealthCheck = {
    timestamp: new Date().toISOString(),
    status: "ok",
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    checks: {
      supabase: false,
      anthropic: false,
      resend: false,
      openai: false,
      whatsapp: false,
    },
    routes: {
      dashboard: true,
      horses: true,
      clients: true,
      stalls: true,
      billing: true,
      calendar: true,
      staff: true,
      services: true,
      documents: true,
      assistant: true,
      analytics: true,
      settings: true,
      onboarding: true,
    },
    latency: {},
  }

  // Check Supabase connection
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const supabaseStart = Date.now()
      const { error } = await supabase.from("stables").select("id").limit(1)
      checks.latency!.supabase = Date.now() - supabaseStart

      if (!error) {
        checks.checks.supabase = true
      }
    }
  } catch (e) {
    console.error("Supabase health check failed:", e)
  }

  // Check Anthropic API key configured
  checks.checks.anthropic = !!process.env.ANTHROPIC_API_KEY

  // Check Resend API key configured
  checks.checks.resend = !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "test"

  // Check OpenAI API key configured (for transcription)
  checks.checks.openai = !!process.env.OPENAI_API_KEY

  // Check WhatsApp configuration
  checks.checks.whatsapp =
    !!process.env.WHATSAPP_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID

  // Determine overall status
  const criticalChecks = checks.checks.supabase && checks.checks.anthropic
  const allChecks = Object.values(checks.checks).every((v) => v)

  if (!criticalChecks) {
    checks.status = "error"
  } else if (!allChecks) {
    checks.status = "degraded"
  }

  return NextResponse.json(checks, {
    status: checks.status === "ok" ? 200 : checks.status === "degraded" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Response-Time": `${Date.now() - startTime}ms`,
    },
  })
}
