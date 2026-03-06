/**
 * FILE: app/services/page.tsx
 * ZONE: Green
 * PURPOSE: Services page route handler
 * EXPORTS: default (page component)
 * DEPENDS ON: modules/services
 * CONSUMED BY: Next.js App Router
 * TESTS: None (route handler)
 * LAST CHANGED: 2026-03-06 — Initial creation for service management
 */

import { ServiceGrid } from "@/modules/services"

export const metadata = { title: "Services | VecHorses" }

export default function ServicesPage() {
  return <ServiceGrid />
}
