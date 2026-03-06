/**
 * FILE: lib/mock/settings.ts
 * ZONE: 🔴 Red
 * PURPOSE: Mock stable settings for V1 invoice generation
 * EXPORTS: mockStableSettings
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: lib/mock/index.ts, modules/billing/hooks/useSettings
 * TESTS: lib/mock/settings.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation for Phase 7b
 */

// 🔴 RED ZONE — billing settings, handle with care

import type { StableSettings } from "@/lib/types"

export const mockStableSettings: StableSettings = {
  stableName: "Scuderia Valle Verde",
  ownerName: "Roberto Marchetti",
  address: "Via delle Scuderie 14",
  city: "Verona, VR 37100",
  country: "Italia",
  phone: "+39 045 123 4567",
  email: "info@scuderiavallverde.it",
  vatNumber: "IT12345678901",
  logoUrl: undefined,
  bankName: "Banca Intesa Sanpaolo",
  bankIban: "IT60 X054 2811 1010 0000 0123 456",
  bankBic: "BCITITMM",
  invoicePrefix: "INV",
  invoiceStartNumber: 1001,
  billingDayOfMonth: 1,
  currency: "EUR",
  invoiceNotes: "Payment due within 30 days of invoice date",
  invoiceFooter: "Thank you for your trust in Scuderia Valle Verde",
}
