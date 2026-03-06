/**
 * FILE: app/settings/page.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Settings page with stable info, billing settings, and invoice history
 * EXPORTS: default (SettingsPage)
 * DEPENDS ON: modules/billing
 * CONSUMED BY: Next.js routing
 * TESTS: app/settings/page.test.tsx
 * LAST CHANGED: 2026-03-06 — Added full settings UI with tabs for Phase 7b
 */

// 🔴 RED ZONE — billing settings, handle with care

"use client"

import { useState } from "react"
import { Building2, Receipt, FileText } from "lucide-react"
import {
  useSettings,
  useUpdateSettings,
  useInvoices,
  StableInfoForm,
  BillingSettingsForm,
  InvoiceHistoryTable,
} from "@/modules/billing"
import { useClients } from "@/modules/clients"
import type { Invoice, StableSettings } from "@/lib/types"

type SettingsTab = "stable" | "billing" | "history"

export default function SettingsPage() {
  const settings = useSettings()
  const updateSettings = useUpdateSettings()
  const invoices = useInvoices()
  const clients = useClients()
  const [activeTab, setActiveTab] = useState<SettingsTab>("stable")

  const handleSave = (updates: Partial<StableSettings>) => {
    updateSettings(updates)
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    alert(`Download PDF for ${invoice.invoiceNumber} — coming in V2`)
  }

  const tabs = [
    { id: "stable" as const, label: "Stable Info", icon: Building2 },
    { id: "billing" as const, label: "Billing Settings", icon: Receipt },
    { id: "history" as const, label: "Invoice History", icon: FileText },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h2>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: "#1A1A2E" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[#2C5F2E] text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-lg p-6" style={{ backgroundColor: "#1A1A2E" }}>
        {activeTab === "stable" && <StableInfoForm settings={settings} onSave={handleSave} />}
        {activeTab === "billing" && <BillingSettingsForm settings={settings} onSave={handleSave} />}
        {activeTab === "history" && (
          <InvoiceHistoryTable invoices={invoices} clients={clients} onDownload={handleDownloadInvoice} />
        )}
      </div>
    </div>
  )
}
