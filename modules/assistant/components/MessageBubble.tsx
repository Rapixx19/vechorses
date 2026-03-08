/**
 * FILE: modules/assistant/components/MessageBubble.tsx
 * ZONE: Green
 * PURPOSE: Chat message bubble for user and assistant messages
 * EXPORTS: MessageBubble
 * DEPENDS ON: lucide-react, ActionCard, SuggestionChips
 * CONSUMED BY: ChatWindow
 * TESTS: modules/assistant/tests/MessageBubble.test.tsx
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, Bot, User } from "lucide-react"
import { ActionCard } from "./ActionCard"
import { SuggestionChips } from "./SuggestionChips"

interface MessageBubbleProps {
  id: string
  role: "user" | "assistant"
  content: string
  actionType?: string
  actionData?: Record<string, unknown>
  suggestions?: string[]
  wasHelpful?: boolean
  onFeedback?: (messageId: string, wasHelpful: boolean, correction?: string) => void
  onSuggestionClick?: (suggestion: string) => void
}

export function MessageBubble({
  id,
  role,
  content,
  actionType,
  actionData,
  suggestions,
  wasHelpful,
  onFeedback,
  onSuggestionClick,
}: MessageBubbleProps) {
  const [showCorrectionInput, setShowCorrectionInput] = useState(false)
  const [correction, setCorrection] = useState("")

  const isUser = role === "user"

  const handleThumbsDown = () => {
    setShowCorrectionInput(true)
  }

  const handleSubmitCorrection = () => {
    onFeedback?.(id, false, correction)
    setShowCorrectionInput(false)
    setCorrection("")
  }

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="flex items-start gap-2 max-w-[80%]">
          <div className="px-4 py-3 rounded-2xl rounded-tr-md bg-[#2C5F2E] text-white">
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2C5F2E]/20 flex items-center justify-center">
            <User className="h-4 w-4 text-[#2C5F2E]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-2 max-w-[85%]">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#252538] flex items-center justify-center">
          <Bot className="h-4 w-4 text-[var(--text-muted)]" />
        </div>
        <div className="space-y-2">
          {/* Message content */}
          <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-[#252538] border border-[var(--border)]">
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{content}</p>
          </div>

          {/* Action card if action was taken */}
          {actionType && actionData && <ActionCard type={actionType} data={actionData} />}

          {/* Suggestion chips */}
          {suggestions && suggestions.length > 0 && (
            <SuggestionChips suggestions={suggestions} onSelect={onSuggestionClick} />
          )}

          {/* Feedback buttons */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onFeedback?.(id, true)}
              className={`p-1.5 rounded-lg transition-colors ${
                wasHelpful === true
                  ? "bg-green-500/20 text-green-400"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              }`}
              title="Helpful"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleThumbsDown}
              className={`p-1.5 rounded-lg transition-colors ${
                wasHelpful === false
                  ? "bg-red-500/20 text-red-400"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              }`}
              title="Not helpful"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Correction input */}
          {showCorrectionInput && (
            <div className="mt-2 p-3 rounded-lg bg-[#1A1A2E] border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] mb-2">What should I have done instead?</p>
              <textarea
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#252538] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E] resize-none"
                rows={2}
                placeholder="Describe the correct action..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSubmitCorrection}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#2C5F2E] hover:bg-[#3a7a3d]"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowCorrectionInput(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
