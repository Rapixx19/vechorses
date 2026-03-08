/**
 * FILE: modules/assistant/components/ConversationHistory.tsx
 * ZONE: Green
 * PURPOSE: Sidebar showing past AI conversations
 * EXPORTS: ConversationHistory
 * DEPENDS ON: lucide-react
 * CONSUMED BY: AssistantPage
 * TESTS: modules/assistant/tests/ConversationHistory.test.tsx
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { Plus, MessageSquare } from "lucide-react"

interface Conversation {
  id: string
  preview: string
  createdAt: string
  messageCount: number
}

interface ConversationHistoryProps {
  conversations: Conversation[]
  currentId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
}

export function ConversationHistory({
  conversations,
  currentId,
  onSelect,
  onNewChat,
}: ConversationHistoryProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Conversations</h3>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2C5F2E] hover:bg-[#3a7a3d] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-muted)]">No conversations yet</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => onSelect(conv.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentId === conv.id
                      ? "bg-[#2C5F2E]/20 border border-[#2C5F2E]/30"
                      : "hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  <p className="text-sm text-[var(--text-primary)] truncate">{conv.preview}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[var(--text-muted)]">{formatDate(conv.createdAt)}</span>
                    <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
                      {conv.messageCount}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
