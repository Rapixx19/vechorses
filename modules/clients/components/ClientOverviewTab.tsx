/**
 * FILE: modules/clients/components/ClientOverviewTab.tsx
 * ZONE: Green
 * PURPOSE: Overview tab showing all client details with profile photo
 * EXPORTS: ClientOverviewTab
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: ClientDetail
 * TESTS: modules/clients/tests/ClientOverviewTab.test.tsx
 * LAST CHANGED: 2026-03-06 — Added large profile photo
 */

import type { Client } from "@/lib/types"

interface ClientOverviewTabProps {
  client: Client
}

const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

export function ClientOverviewTab({ client }: ClientOverviewTabProps) {
  const formatDate = (dateStr: string | null) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        {client.photoUrl ? (
          <img src={client.photoUrl} alt={client.fullName} className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-medium" style={{ backgroundColor: "#2C5F2E" }}>
            {getInitials(client.fullName)}
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">{client.fullName}</h3>
          <p className="text-sm text-[var(--text-muted)]">{client.email}</p>
          <p className="text-sm text-[var(--text-muted)]">{client.phone}</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard label="Full Name" value={client.fullName} />
        <InfoCard label="Email" value={client.email} />
        <InfoCard label="Phone" value={client.phone} />
        <InfoCard label="Status" value={client.isActive ? "Active" : "Inactive"} />
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard label="Name" value={client.emergencyContactName || "Not provided"} />
          <InfoCard label="Phone" value={client.emergencyContactPhone || "Not provided"} />
        </div>
      </div>

      {/* GDPR Consent */}
      <div>
        <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">GDPR Consent</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard label="Consent Date" value={formatDate(client.gdprConsentAt)} />
          <InfoCard label="Consent Version" value={client.gdprConsentVersion || "—"} />
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Notes</h4>
        <p className="text-sm text-[var(--text-muted)]">{client.notes || "No notes"}</p>
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-[var(--text-primary)]">{value}</p>
    </div>
  )
}
