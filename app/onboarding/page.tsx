/**
 * FILE: app/onboarding/page.tsx
 * ZONE: Green
 * PURPOSE: Onboarding wizard page with SSR disabled
 * EXPORTS: default (page component)
 * DEPENDS ON: modules/onboarding
 * CONSUMED BY: Next.js App Router
 * TESTS: None (route handler)
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import dynamic from "next/dynamic"

const OnboardingWizard = dynamic(
  () => import("@/modules/onboarding/components/OnboardingWizard").then((mod) => mod.OnboardingWizard),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function OnboardingPage() {
  return <OnboardingWizard />
}
