/**
 * FILE: app/page.tsx
 * ZONE: Green
 * PURPOSE: Home page redirect to dashboard
 * EXPORTS: default (HomePage)
 * DEPENDS ON: next/navigation
 * CONSUMED BY: Next.js routing
 * TESTS: None (redirect page)
 * LAST CHANGED: 2026-03-05 — Redirect to dashboard
 */

import { redirect } from "next/navigation"

export default function HomePage() {
  redirect("/dashboard")
}
