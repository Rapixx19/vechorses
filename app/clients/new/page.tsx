/**
 * FILE: app/clients/new/page.tsx
 * ZONE: Green
 * PURPOSE: Add new client form page
 * EXPORTS: default (NewClientPage)
 * DEPENDS ON: modules/clients
 * CONSUMED BY: Next.js routing
 * TESTS: app/clients/new/page.test.tsx
 * LAST CHANGED: 2026-03-07 — Wired to Supabase via useCreateClient
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ClientForm, useCreateClient, type CreateClientInput } from "@/modules/clients"

export default function NewClientPage() {
  const router = useRouter()
  const { addClient } = useCreateClient()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CreateClientInput) => {
    setError(null)
    setIsSubmitting(true)

    const result = await addClient(data)

    if (result.success) {
      router.push("/clients")
    } else {
      setError(result.error || "Failed to create client")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Add New Client</h2>
      </div>
      {error && (
        <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}
      <div className="rounded-lg p-6" style={{ backgroundColor: "#1A1A2E" }}>
        <ClientForm onSubmit={handleSubmit} />
        {isSubmitting && (
          <div className="mt-4 text-center text-[var(--text-muted)]">Saving...</div>
        )}
      </div>
    </div>
  )
}
