/**
 * FILE: components/ui/SearchInput.tsx
 * ZONE: Green
 * PURPOSE: Consistent search input component used across all list/filter pages
 * EXPORTS: SearchInput, SearchInputProps
 * DEPENDS ON: react, lucide-react
 * CONSUMED BY: Horses, Clients, Staff, Documents, Services, Billing pages
 * TESTS: components/ui/tests/SearchInput.test.tsx
 * LAST CHANGED: 2026-03-14 — Initial creation for UI consistency audit
 */

"use client"

import { Search, X } from "lucide-react"

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full pl-10 pr-10 h-10
          bg-[#1A1A2E] border border-[#2a2a3e]
          rounded-xl text-white text-sm
          placeholder:text-gray-500
          focus:border-[#2C5F2E]
          focus:outline-none
          focus:ring-1
          focus:ring-[#2C5F2E]
          transition-colors
        "
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
