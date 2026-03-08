/**
 * FILE: modules/clients/components/NewClientPage.tsx
 * ZONE: Green
 * PURPOSE: Add new client form content (extracted for SSR-safe dynamic import)
 * EXPORTS: NewClientPage
 * DEPENDS ON: modules/clients
 * CONSUMED BY: app/clients/new/page.tsx
 * TESTS: modules/clients/tests/NewClientPage.test.tsx
 * LAST CHANGED: 2026-03-08 — Extracted from app/clients/new/page.tsx for SSR fix
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ClientForm } from "./ClientForm"
import { useCreateClient, type CreateClientInput } from "../hooks/useClients"

export function NewClientPage() {
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
