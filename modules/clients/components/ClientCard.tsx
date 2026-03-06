/**
 * FILE: modules/clients/components/ClientCard.tsx
 * ZONE: Green
 * PURPOSE: Clickable card displaying client summary with photo and revenue
 * EXPORTS: ClientCard
 * DEPENDS ON: lib/types.ts, next/link, lucide-react
 * CONSUMED BY: ClientList
 * TESTS: modules/clients/tests/ClientCard.test.tsx
 * LAST CHANGED: 2026-03-06 — Added photo support and revenue badge
 */

import Link from "next/link"
import { Mail, Phone, Check, AlertTriangle } from "lucide-react"
import type { Client, BillingLineItem } from "@/lib/types"

interface ClientCardProps {
  client: Client
  horseCount: number
  billingItems: BillingLineItem[]
}

const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

export function ClientCard({ client, horseCount, billingItems }: ClientCardProps) {
  const hasConsent = !!client.gdprConsentAt
  const totalRevenue = billingItems
    .filter((b) => b.clientId === client.id && b.status === "paid")
    .reduce((sum, b) => sum + b.amountCents, 0)

  const formatRevenue = (cents: number) => `€${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  return (
    <Link href={`/clients/${client.id}`}>
      <div className="rounded-lg p-4 hover:bg-[#252538] transition-colors cursor-pointer" style={{ backgroundColor: "#1A1A2E" }}>
        <div className="flex gap-3">
          {client.photoUrl ? (
            <img src={client.photoUrl} alt={client.fullName} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ backgroundColor: "#2C5F2E" }}>
              {getInitials(client.fullName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[var(--text-primary)] truncate">{client.fullName}</h3>
              {totalRevenue > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-900/30 text-green-400">
                  {formatRevenue(totalRevenue)} revenue
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>
              <span>{horseCount} horse{horseCount !== 1 ? "s" : ""}</span>
            </div>
            <div className="mt-2">
              {hasConsent ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-green-400"><Check className="h-3 w-3" />Consented</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400"><AlertTriangle className="h-3 w-3" />No consent</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
