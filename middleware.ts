/**
 * FILE: middleware.ts
 * ZONE: 🔴 Red — critical security infrastructure
 * PURPOSE: Route matching for Next.js (auth handled client-side in V1)
 * EXPORTS: middleware, config
 * DEPENDS ON: next/server
 * CONSUMED BY: Next.js middleware system
 * TESTS: middleware.test.ts
 * LAST CHANGED: 2026-03-06 — Simplified for V1, removed Supabase Edge incompatibility
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_ROUTES = ["/login", "/register", "/join"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow static files and api routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // For now let all routes through —
  // auth is handled client-side by AuthContext
  // Server-side auth protection added in V2 Phase 2
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
