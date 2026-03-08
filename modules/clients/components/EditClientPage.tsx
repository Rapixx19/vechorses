/**
 * FILE: modules/clients/components/EditClientPage.tsx
 * ZONE: Green
 * PURPOSE: Edit client form content (extracted for SSR-safe dynamic import)
 * EXPORTS: EditClientPage
 * DEPENDS ON: modules/clients
 * CONSUMED BY: app/clients/[id]/edit/page.tsx
 * TESTS: modules/clients/tests/EditClientPage.test.tsx
 * LAST CHANGED: 2026-03-08 — Extracted from app/clients/[id]/edit/page.tsx for SSR fix
 */

"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ClientForm } from "./ClientForm"
import { useClients } from "../hooks/useClients"

interface EditClientPageProps {
  clientId: string
}

export function EditClientPage({ clientId }: EditClientPageProps) {
  const router = useRouter()
  const { clients, isLoading } = useClients()
  const client = clients.find((c) => c.id === clientId)

  const handleSubmit = (data: Parameters<typeof ClientForm>[0] extends { onSubmit: (d: infer T) => void } ? T : never) => {
    // BREADCRUMB: V1 mock - just log and redirect. Real save comes in V2
    console.log("Update client:", clientId, data)
    router.push(`/clients/${clientId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C5F2E]" />
      </div>
    )
  }

  if (!client) {
    return <p className="text-red-400">Client not found</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/clients/${clientId}`} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Edit {client.fullName}</h2>
      </div>
      <div className="rounded-lg p-6" style={{ backgroundColor: "#1A1A2E" }}>
        <ClientForm initialData={client} onSubmit={handleSubmit} isEditing />
      </div>
    </div>
  )
}
