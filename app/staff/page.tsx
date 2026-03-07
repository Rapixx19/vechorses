/**
 * FILE: app/staff/page.tsx
 * ZONE: Green
 * PURPOSE: Staff management page route
 * EXPORTS: default (StaffPageRoute)
 * DEPENDS ON: modules/staff
 * CONSUMED BY: Next.js routing
 * TESTS: app/staff/page.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for staff management
 */

import { StaffPage } from "@/modules/staff"

export default function StaffPageRoute() {
  return <StaffPage />
}
