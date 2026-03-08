/**
 * FILE: app/horses/[id]/edit/page.tsx
 * ZONE: Green
 * PURPOSE: Edit horse page route with SSR disabled
 * EXPORTS: default (EditHorsePageRoute)
 * DEPENDS ON: modules/horses
 * CONSUMED BY: Next.js routing
 * TESTS: app/horses/[id]/edit/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Disabled SSR to fix mobile hydration crash
 */

"use client"

import { use } from "react"
import dynamic from "next/dynamic"

const EditHorsePage = dynamic(
  () => import("@/modules/horses").then((mod) => mod.EditHorsePage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2C5F2E] border-t-transparent rounded-full" />
      </div>
    ),
  }
)

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditHorsePageRoute({ params }: PageProps) {
  const { id } = use(params)
  return <EditHorsePage horseId={id} />
}
