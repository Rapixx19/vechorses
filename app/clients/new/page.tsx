/**
 * FILE: app/clients/new/page.tsx
 * ZONE: Green
 * PURPOSE: Add new client form page
 * EXPORTS: default (NewClientPage)
 * DEPENDS ON: modules/clients
 * CONSUMED BY: Next.js routing
 * TESTS: app/clients/new/page.test.tsx
 * LAST CHANGED: 2026-03-06 — Added ClientForm component
 */

"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ClientForm } from "@/modules/clients"

export default function NewClientPage() {
  const router = useRouter()

  const handleSubmit = (data: Parameters<typeof ClientForm>[0] extends { onSubmit: (d: infer T) => void } ? T : never) => {
    // BREADCRUMB: V1 mock - just log and redirect. Real save comes in V2
    console.log("New client:", data)
    router.push("/clients")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Add New Client</h2>
      </div>
      <div className="rounded-lg p-6" style={{ backgroundColor: "#1A1A2E" }}>
        <ClientForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
