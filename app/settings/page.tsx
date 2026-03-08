/**
 * FILE: app/settings/page.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Settings page with stable info, billing settings, invoice history, team, and WhatsApp
 * EXPORTS: default (SettingsPage)
 * DEPENDS ON: modules/billing, modules/clients, modules/settings
 * CONSUMED BY: Next.js routing
 * TESTS: app/settings/page.test.tsx
 * LAST CHANGED: 2026-03-08 — Added WhatsApp integration settings tab
 */

// 🔴 RED ZONE — billing settings, handle with care

"use client"

import { useState } from "react"
import { Building2, Receipt, FileText, Users, X, MessageCircle } from "lucide-react"
import {
  useSettings,
  useUpdateSettings,
  useInvoices,
  StableInfoForm,
  BillingSettingsForm,
  InvoiceHistoryTable,
  InvoicePreview,
  generateInvoicePdf,
} from "@/modules/billing"
import { useClients } from "@/modules/clients"
import { TeamManager, WhatsAppSettings } from "@/modules/settings"
import type { Invoice, StableSettings } from "@/lib/types"

type SettingsTab = "stable" | "billing" | "history" | "team" | "whatsapp"

export default function SettingsPage() {
  // All hooks must be called before any conditional returns
  const settings = useSettings()
  const updateSettings = useUpdateSettings()
  const { invoices, isLoading: invoicesLoading } = useInvoices()
  const { clients, isLoading: clientsLoading } = useClients()
  const [activeTab, setActiveTab] = useState<SettingsTab>("stable")
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)

  if (clientsLoading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C5F2E]" />
      </div>
    )
  }

  const handleSave = async (updates: Partial<StableSettings>) => {
    await updateSettings(updates)
  }

  const handlePreviewInvoice = (invoice: Invoice) => {
    setPreviewInvoice(invoice)
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    const client = clients.find((c) => c.id === invoice.clientId)
    const filename = `${invoice.invoiceNumber}-${client?.fullName.replace(/\s+/g, "-") || "invoice"}.pdf`
    generateInvoicePdf("invoice-preview-modal", filename)
  }

  const tabs = [
    { id: "stable" as const, label: "Stable Info", icon: Building2 },
    { id: "billing" as const, label: "Billing & Invoices", icon: Receipt },
    { id: "history" as const, label: "Invoice History", icon: FileText },
    { id: "team" as const, label: "Team", icon: Users },
    { id: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle },
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
          <InvoiceHistoryTable
            invoices={invoices}
            clients={clients}
            onPreview={handlePreviewInvoice}
            onDownload={handleDownloadInvoice}
          />
        )}
        {activeTab === "team" && <TeamManager />}
        {activeTab === "whatsapp" && <WhatsAppSettings />}
      </div>

      {/* Invoice Preview Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setPreviewInvoice(null)}>
          <div className="relative max-h-[90vh] overflow-auto bg-white rounded-lg" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewInvoice(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-100 rounded-full text-gray-600 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>
            <div id="invoice-preview-modal">
              <InvoicePreview invoice={previewInvoice} settings={settings} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
