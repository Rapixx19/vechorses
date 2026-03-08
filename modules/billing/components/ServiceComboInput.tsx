/**
 * FILE: modules/billing/components/ServiceComboInput.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Combo input for selecting services or typing custom descriptions
 * EXPORTS: ServiceComboInput
 * DEPENDS ON: lib/types.ts, react
 * CONSUMED BY: InvoiceBuilder
 * TESTS: modules/billing/tests/ServiceComboInput.test.tsx
 * LAST CHANGED: 2026-03-08 — Initial creation for invoice line item redesign
 */

// 🔴 RED ZONE — billing invoice builder, handle with care

"use client"

import { useState, useEffect, useRef } from "react"
import type { Service } from "@/lib/types"

interface ServiceComboInputProps {
  value: string
  services: Service[]
  onSelect: (service: Service) => void
  onChange: (description: string) => void
}

export function ServiceComboInput({
  value,
  services,
  onSelect,
  onChange,
}: ServiceComboInputProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(value)
  const ref = useRef<HTMLDivElement>(null)

  // Sync search with external value
  useEffect(() => {
    setSearch(value)
  }, [value])

  // Filter services by search
  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const formatPrice = (cents: number) => (cents / 100).toFixed(2)

  return (
    <div ref={ref} className="relative flex-1">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Select service or type custom..."
        className="w-full bg-[#252538] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm focus:border-[#2C5F2E] focus:outline-none"
      />

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A2E] border border-[var(--border)] rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
          {/* Existing services section */}
          {filtered.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider border-b border-[var(--border)]">
                Your Services
              </div>
              {filtered.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    onSelect(service)
                    setSearch(service.name)
                    setOpen(false)
                  }}
                  className="w-full px-3 py-2.5 text-left hover:bg-[#252538] flex items-center justify-between group transition-colors"
                >
                  <div>
                    <div className="text-[var(--text-primary)] text-sm font-medium">
                      {service.name}
                    </div>
                    <div className="text-[var(--text-muted)] text-xs">
                      {service.category}
                    </div>
                  </div>
                  <div className="text-[#2C5F2E] text-sm font-medium">
                    {service.currency} {formatPrice(service.price)}
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Custom entry option */}
          {search.trim() && (
            <button
              type="button"
              onClick={() => {
                onChange(search)
                setOpen(false)
              }}
              className="w-full px-3 py-2.5 text-left hover:bg-[#252538] border-t border-[var(--border)] flex items-center gap-2"
            >
              <span className="text-[#2C5F2E]">+</span>
              <span className="text-[var(--text-muted)] text-sm">
                Use &quot;{search}&quot; as custom item
              </span>
            </button>
          )}

          {filtered.length === 0 && !search && (
            <div className="px-3 py-4 text-center text-[var(--text-muted)] text-sm">
              No services yet. Type to add custom.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
