/**
 * FILE: app/assistant/page.tsx
 * ZONE: Green
 * PURPOSE: AI Assistant page route
 * EXPORTS: default (page component)
 * DEPENDS ON: modules/assistant
 * CONSUMED BY: Next.js App Router
 * TESTS: None (route handler)
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

import { AssistantPage } from "@/modules/assistant"

export default function AssistantRoute() {
  return <AssistantPage />
}
