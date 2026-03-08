/**
 * FILE: modules/assistant/components/AssistantPage.tsx
 * ZONE: Green
 * PURPOSE: Main assistant page with split layout (history + chat)
 * EXPORTS: AssistantPage
 * DEPENDS ON: ChatWindow, ConversationHistory, useAssistantChat
 * CONSUMED BY: app/assistant/page.tsx
 * TESTS: modules/assistant/tests/AssistantPage.test.tsx
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { useState } from "react"
import { History, X } from "lucide-react"
import { ChatWindow } from "./ChatWindow"
import { ConversationHistory } from "./ConversationHistory"
import { useAssistantChat } from "../hooks/useAssistantChat"
import { useIsMobile } from "@/lib/hooks/useMediaQuery"

export function AssistantPage() {
  const isMobile = useIsMobile()
  const [showHistory, setShowHistory] = useState(false)
  const {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    isSending,
    sendMessage,
    startNewConversation,
    loadConversation,
    submitFeedback,
  } = useAssistantChat()

  const handleSelectConversation = (id: string) => {
    loadConversation(id)
    if (isMobile) {
      setShowHistory(false)
    }
  }

  const handleNewChat = () => {
    startNewConversation()
    if (isMobile) {
      setShowHistory(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C5F2E]" />
      </div>
    )
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)] -mx-4 -mt-4">
        {/* Mobile header with history button */}
        <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-surface)]">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <History className="h-4 w-4" />
            History
          </button>
        </div>

        {/* Chat window */}
        <div className="flex-1 bg-[var(--bg-surface)]">
          <ChatWindow
            messages={messages}
            isSending={isSending}
            onSendMessage={sendMessage}
            onFeedback={submitFeedback}
            onClear={startNewConversation}
          />
        </div>

        {/* History sheet */}
        {showHistory && (
          <div className="fixed inset-0 z-50" onClick={() => setShowHistory(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-[var(--bg-surface)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">History</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 -mr-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ConversationHistory
                conversations={conversations}
                currentId={currentConversationId}
                onSelect={handleSelectConversation}
                onNewChat={handleNewChat}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop layout
  return (
    <div className="flex h-[calc(100vh-120px)] -mx-6 -mt-6 rounded-lg overflow-hidden bg-[var(--bg-surface)]">
      {/* Left sidebar - conversation history */}
      <div className="w-[280px] border-r border-[var(--border)] bg-[var(--bg-primary)]">
        <ConversationHistory
          conversations={conversations}
          currentId={currentConversationId}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1">
        <ChatWindow
          messages={messages}
          isSending={isSending}
          onSendMessage={sendMessage}
          onFeedback={submitFeedback}
          onClear={startNewConversation}
        />
      </div>
    </div>
  )
}
