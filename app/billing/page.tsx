/**
 * FILE: app/billing/page.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Billing page route with SSR disabled
 * EXPORTS: default (BillingPageRoute)
 * DEPENDS ON: modules/billing
 * CONSUMED BY: Next.js routing
 * TESTS: app/billing/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

// 🔴 RED ZONE — billing data is written by external freelancer, we only read

"use client"

import dynamic from "next/dynamic"

const BillingPage = dynamic(
  () => import("@/modules/billing").then((mod) => mod.BillingPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function BillingPageRoute() {
  return <BillingPage />
}
