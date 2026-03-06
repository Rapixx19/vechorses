/**
 * FILE: app/clients/[id]/edit/page.tsx
 * ZONE: Green
 * PURPOSE: Edit client form page
 * EXPORTS: default (EditClientPage)
 * DEPENDS ON: modules/clients
 * CONSUMED BY: Next.js routing
 * TESTS: app/clients/[id]/edit/page.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useClients, ClientForm } from "@/modules/clients"
import { use } from "react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditClientPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { clients, isLoading } = useClients()
  const client = clients.find((c) => c.id === id)

  const handleSubmit = (data: Parameters<typeof ClientForm>[0] extends { onSubmit: (d: infer T) => void } ? T : never) => {
    // BREADCRUMB: V1 mock - just log and redirect. Real save comes in V2
    console.log("Update client:", id, data)
    router.push(`/clients/${id}`)
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
        <Link href={`/clients/${id}`} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
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
