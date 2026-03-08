/**
 * FILE: modules/assistant/components/SuggestionChips.tsx
 * ZONE: Green
 * PURPOSE: Clickable suggestion chips after AI responses
 * EXPORTS: SuggestionChips
 * DEPENDS ON: None
 * CONSUMED BY: MessageBubble
 * TESTS: modules/assistant/tests/SuggestionChips.test.tsx
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

interface SuggestionChipsProps {
  suggestions: string[]
  onSelect?: (suggestion: string) => void
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => onSelect?.(suggestion)}
          className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)] bg-[#252538] border border-[var(--border)] hover:border-[#2C5F2E] hover:text-[var(--text-primary)] transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
