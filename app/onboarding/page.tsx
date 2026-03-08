/**
 * FILE: app/onboarding/page.tsx
 * ZONE: Green
 * PURPOSE: Onboarding wizard page for new stable setup
 * EXPORTS: default (page component)
 * DEPENDS ON: modules/onboarding/components/OnboardingWizard
 * CONSUMED BY: Next.js App Router
 * TESTS: None (route handler)
 * LAST CHANGED: 2026-03-08 — Initial creation for onboarding flow
 */

import { OnboardingWizard } from "@/modules/onboarding/components/OnboardingWizard"

export default function OnboardingPage() {
  return <OnboardingWizard />
}
