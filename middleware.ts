/**
 * FILE: middleware.ts
 * ZONE: 🔴 Red — critical security infrastructure
 * PURPOSE: Minimal passthrough middleware (auth handled client-side)
 * EXPORTS: middleware, config
 * DEPENDS ON: next/server
 * CONSUMED BY: Next.js middleware system
 * TESTS: middleware.test.ts
 * LAST CHANGED: 2026-03-06 — Simplified to fix Vercel Edge Runtime crash
 */

import { NextResponse, type NextRequest } from "next/server"

export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
