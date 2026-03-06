/**
 * FILE: lib/mock/invoices.ts
 * ZONE: 🔴 Red
 * PURPOSE: Mock invoices for V1 invoice history
 * EXPORTS: mockInvoices
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: lib/mock/index.ts, modules/billing/hooks/useInvoices
 * TESTS: lib/mock/invoices.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation for Phase 7b
 */

// 🔴 RED ZONE — billing invoices, handle with care

import type { Invoice } from "@/lib/types"

export const mockInvoices: Invoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-1001",
    clientId: "client-001",
    lineItems: [
      { id: "li-001", clientId: "client-001", serviceType: "boarding", description: "Monthly boarding fee - January 2026", amountCents: 45000, currency: "EUR", status: "paid", serviceDate: "2026-01-01", createdAt: "2026-01-01T00:00:00Z" },
    ],
    subtotal: 45000,
    tax: 9900,
    taxRate: 22,
    total: 54900,
    status: "paid",
    issuedDate: "2026-01-01",
    dueDate: "2026-01-31",
    paidDate: "2026-01-15",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-1002",
    clientId: "client-004",
    lineItems: [
      { id: "li-002", clientId: "client-004", serviceType: "boarding", description: "Monthly boarding fee - January 2026", amountCents: 45000, currency: "EUR", status: "paid", serviceDate: "2026-01-01", createdAt: "2026-01-01T00:00:00Z" },
      { id: "li-003", clientId: "client-004", serviceType: "lesson", description: "Jumping lessons (4x)", amountCents: 24000, currency: "EUR", status: "paid", serviceDate: "2026-01-15", createdAt: "2026-01-15T00:00:00Z" },
    ],
    subtotal: 69000,
    tax: 15180,
    taxRate: 22,
    total: 84180,
    status: "paid",
    issuedDate: "2026-01-31",
    dueDate: "2026-02-28",
    paidDate: "2026-02-10",
    createdAt: "2026-01-31T00:00:00Z",
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-1003",
    clientId: "client-002",
    lineItems: [
      { id: "li-004", clientId: "client-002", serviceType: "boarding", description: "Monthly boarding fee - February 2026 (2 horses)", amountCents: 90000, currency: "EUR", status: "invoiced", serviceDate: "2026-02-01", createdAt: "2026-02-01T00:00:00Z" },
      { id: "li-005", clientId: "client-002", serviceType: "farrier", description: "Corrective shoeing - therapeutic", amountCents: 18000, currency: "EUR", status: "invoiced", serviceDate: "2026-02-20", createdAt: "2026-02-20T10:00:00Z" },
    ],
    subtotal: 108000,
    tax: 23760,
    taxRate: 22,
    total: 131760,
    status: "sent",
    issuedDate: "2026-02-28",
    dueDate: "2026-03-30",
    createdAt: "2026-02-28T00:00:00Z",
  },
  {
    id: "inv-004",
    invoiceNumber: "INV-1004",
    clientId: "client-003",
    lineItems: [
      { id: "li-006", clientId: "client-003", serviceType: "boarding", description: "Monthly boarding fee - February 2026 (3 horses)", amountCents: 135000, currency: "EUR", status: "invoiced", serviceDate: "2026-02-01", createdAt: "2026-02-01T00:00:00Z" },
    ],
    subtotal: 135000,
    tax: 29700,
    taxRate: 22,
    total: 164700,
    status: "sent",
    issuedDate: "2026-02-28",
    dueDate: "2026-03-30",
    createdAt: "2026-02-28T00:00:00Z",
  },
  {
    id: "inv-005",
    invoiceNumber: "INV-1005",
    clientId: "client-006",
    lineItems: [
      { id: "li-007", clientId: "client-006", serviceType: "farrier", description: "Farrier visit - full set", amountCents: 12000, currency: "EUR", status: "pending", serviceDate: "2026-03-03", createdAt: "2026-03-03T11:00:00Z" },
    ],
    subtotal: 12000,
    taxRate: 0,
    total: 12000,
    status: "draft",
    issuedDate: "2026-03-05",
    dueDate: "2026-04-04",
    notes: "Awaiting confirmation of additional services",
    createdAt: "2026-03-05T00:00:00Z",
  },
]
