/**
 * FILE: modules/billing/hooks/useSettings.ts
 * ZONE: 🔴 Red
 * PURPOSE: Hook for stable settings state management from Supabase
 * EXPORTS: useSettings, useUpdateSettings
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: InvoiceBuilder, app/settings/page.tsx
 * TESTS: modules/billing/tests/useSettings.test.ts
 * LAST CHANGED: 2026-03-07 — V2: Wired to Supabase stables table
 */

// 🔴 RED ZONE — billing settings, handle with care

"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { StableSettings } from "@/lib/types"

// Default empty settings (used when no stable exists yet)
const defaultSettings: StableSettings = {
  stableName: "",
  ownerName: "",
  address: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  vatNumber: "",
  logoUrl: undefined,
  bankName: "",
  bankIban: "",
  bankBic: "",
  invoicePrefix: "INV",
  invoiceStartNumber: 1001,
  billingDayOfMonth: 1,
  currency: "EUR",
  invoiceNotes: "",
  invoiceFooter: "",
}

// DB row type from Supabase stables table
interface StableRow {
  id: string
  stable_name: string
  owner_user_id: string | null
  referral_code: string
  country: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  vat_number: string | null
  logo_url: string | null
  logo_data: string | null
  bank_name: string | null
  bank_iban: string | null
  bank_bic: string | null
  invoice_prefix: string | null
  invoice_start_number: number | null
  billing_day_of_month: number | null
  currency: string | null
  invoice_notes: string | null
  invoice_footer: string | null
  created_at: string | null
  // Invoice personalization fields
  invoice_accent_color: string | null
  invoice_footer_note: string | null
  payment_terms_days: number | null
  // Auto invoice fields
  auto_invoice_enabled: boolean | null
  auto_invoice_day: number | null
  auto_invoice_services: string[] | null
  auto_invoice_clients: string | null
  auto_invoice_email_enabled: boolean | null
}

export function useSettings(): StableSettings {
  const { currentUser } = useAuth()
  const [settings, setSettings] = useState<StableSettings>(defaultSettings)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!currentUser?.stableId) {
      // Use defaults with user's name if available
      setSettings({
        ...defaultSettings,
        ownerName: currentUser?.fullName || "",
        email: currentUser?.email || "",
        stableName: currentUser?.stableName || "",
      })
      return
    }

    async function fetchSettings() {
      const { data, error } = await supabase
        .from("stables")
        .select("*")
        .eq("id", currentUser!.stableId)
        .single()

      if (error || !data) {
        console.error("Failed to fetch stable settings:", error)
        return
      }

      const row = data as StableRow
      setSettings({
        stableName: row.stable_name || "",
        ownerName: currentUser?.fullName || "",
        address: row.address || "",
        city: row.city || "",
        country: row.country || "",
        phone: row.phone || "",
        email: row.email || "",
        website: row.website || undefined,
        vatNumber: row.vat_number || undefined,
        logoUrl: row.logo_url || undefined,
        logoData: row.logo_data || undefined,
        bankName: row.bank_name || undefined,
        bankIban: row.bank_iban || undefined,
        bankBic: row.bank_bic || undefined,
        invoicePrefix: row.invoice_prefix || "INV",
        invoiceStartNumber: row.invoice_start_number || 1001,
        billingDayOfMonth: row.billing_day_of_month || 1,
        currency: row.currency || "EUR",
        invoiceNotes: row.invoice_notes || undefined,
        invoiceFooter: row.invoice_footer || undefined,
        // Invoice personalization
        invoiceAccentColor: row.invoice_accent_color || "#2C5F2E",
        invoiceFooterNote: row.invoice_footer_note || undefined,
        paymentTermsDays: row.payment_terms_days || 30,
        // Auto invoice settings
        autoInvoiceEnabled: row.auto_invoice_enabled || false,
        autoInvoiceDay: row.auto_invoice_day || 1,
        autoInvoiceServices: row.auto_invoice_services || [],
        autoInvoiceClients: (row.auto_invoice_clients as "all" | "selected") || "all",
        autoInvoiceEmailEnabled: row.auto_invoice_email_enabled || false,
      })
    }

    fetchSettings()
  }, [currentUser?.stableId, currentUser?.fullName, currentUser?.email, currentUser?.stableName, supabase])

  return settings
}

export function useUpdateSettings(): (updates: Partial<StableSettings>) => Promise<void> {
  const { currentUser } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  return useCallback(
    async (updates: Partial<StableSettings>) => {
      if (!currentUser?.stableId) {
        console.warn("Cannot update settings: no stableId")
        return
      }

      // Map camelCase to snake_case for DB
      const dbUpdates: Record<string, unknown> = {}
      if (updates.stableName !== undefined) dbUpdates.stable_name = updates.stableName
      if (updates.address !== undefined) dbUpdates.address = updates.address
      if (updates.city !== undefined) dbUpdates.city = updates.city
      if (updates.country !== undefined) dbUpdates.country = updates.country
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone
      if (updates.email !== undefined) dbUpdates.email = updates.email
      if (updates.website !== undefined) dbUpdates.website = updates.website
      if (updates.vatNumber !== undefined) dbUpdates.vat_number = updates.vatNumber
      if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl
      if (updates.logoData !== undefined) dbUpdates.logo_data = updates.logoData
      if (updates.bankName !== undefined) dbUpdates.bank_name = updates.bankName
      if (updates.bankIban !== undefined) dbUpdates.bank_iban = updates.bankIban
      if (updates.bankBic !== undefined) dbUpdates.bank_bic = updates.bankBic
      if (updates.invoicePrefix !== undefined) dbUpdates.invoice_prefix = updates.invoicePrefix
      if (updates.invoiceStartNumber !== undefined) dbUpdates.invoice_start_number = updates.invoiceStartNumber
      if (updates.billingDayOfMonth !== undefined) dbUpdates.billing_day_of_month = updates.billingDayOfMonth
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency
      if (updates.invoiceNotes !== undefined) dbUpdates.invoice_notes = updates.invoiceNotes
      if (updates.invoiceFooter !== undefined) dbUpdates.invoice_footer = updates.invoiceFooter
      // Invoice personalization fields
      if (updates.invoiceAccentColor !== undefined) dbUpdates.invoice_accent_color = updates.invoiceAccentColor
      if (updates.invoiceFooterNote !== undefined) dbUpdates.invoice_footer_note = updates.invoiceFooterNote
      if (updates.paymentTermsDays !== undefined) dbUpdates.payment_terms_days = updates.paymentTermsDays
      // Auto invoice fields
      if (updates.autoInvoiceEnabled !== undefined) dbUpdates.auto_invoice_enabled = updates.autoInvoiceEnabled
      if (updates.autoInvoiceDay !== undefined) dbUpdates.auto_invoice_day = updates.autoInvoiceDay
      if (updates.autoInvoiceServices !== undefined) dbUpdates.auto_invoice_services = updates.autoInvoiceServices
      if (updates.autoInvoiceClients !== undefined) dbUpdates.auto_invoice_clients = updates.autoInvoiceClients
      if (updates.autoInvoiceEmailEnabled !== undefined) dbUpdates.auto_invoice_email_enabled = updates.autoInvoiceEmailEnabled

      const { error } = await supabase
        .from("stables")
        .update(dbUpdates)
        .eq("id", currentUser.stableId)

      if (error) {
        console.error("Failed to update settings:", error)
        throw new Error(error.message)
      }
    },
    [currentUser?.stableId, supabase]
  )
}
