/**
 * FILE: modules/clients/components/ClientDetail.tsx
 * ZONE: Green
 * PURPOSE: Full client profile with tabbed interface
 * EXPORTS: ClientDetail
 * DEPENDS ON: useClients, ClientOverviewTab, ClientHorses, ClientBillingHistory, ClientDocumentList, ClientDocumentUpload
 * CONSUMED BY: app/clients/[id]/page.tsx
 * TESTS: modules/clients/tests/ClientDetail.test.tsx
 * LAST CHANGED: 2026-03-06 — Added Documents tab and ClientBillingHistory
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, UserX } from "lucide-react"
import { useClients } from "@/modules/clients"
import { ClientOverviewTab } from "./ClientOverviewTab"
import { ClientHorses } from "./ClientHorses"
import { ClientBillingHistory } from "./ClientBillingHistory"
import { ClientDocumentList } from "./ClientDocumentList"
import { ClientDocumentUpload } from "./ClientDocumentUpload"

interface ClientDetailProps {
  clientId: string
}

type Tab = "overview" | "horses" | "billing" | "documents"

export function ClientDetail({ clientId }: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const router = useRouter()
  const clients = useClients()

  const client = clients.find((c) => c.id === clientId)
  if (!client) return <p className="text-red-400">Client not found</p>

  const handleDeactivate = () => {
    // BREADCRUMB: V1 mock - just redirect. Real deactivation in V2.
    alert("Client deactivated (mock)")
    router.push("/clients")
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "horses", label: "Horses" },
    { id: "billing", label: "Billing" },
    { id: "documents", label: "Documents" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{client.fullName}</h2>
        <div className="flex gap-2">
          <button onClick={handleDeactivate} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-red-400 border border-red-400/30 hover:bg-red-400/10">
            <UserX className="h-4 w-4" />Deactivate
          </button>
          <Link href={`/clients/${clientId}/edit`} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[#1A1A2E] text-[var(--text-primary)] hover:bg-[#252538]">
            <Pencil className="h-4 w-4" />Edit
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${activeTab === tab.id ? "border-[#2C5F2E] text-[#2C5F2E]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <ClientOverviewTab client={client} />}
      {activeTab === "horses" && <ClientHorses clientId={clientId} />}
      {activeTab === "billing" && <ClientBillingHistory clientId={clientId} />}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <ClientDocumentUpload />
          <ClientDocumentList clientId={clientId} />
        </div>
      )}
    </div>
  )
}
