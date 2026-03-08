/**
 * FILE: modules/assistant/hooks/useAssistantChat.ts
 * ZONE: Yellow
 * PURPOSE: Hook for AI assistant chat state and API calls
 * EXPORTS: useAssistantChat
 * DEPENDS ON: lib/supabase.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: AssistantPage, ChatWindow
 * TESTS: modules/assistant/tests/useAssistantChat.test.ts
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"

// BREADCRUMB: Types for AI assistant messages and actions
export interface AIMessage {
  id: string
  conversationId: string
  role: "user" | "assistant"
  content: string
  actionType?: string
  actionData?: Record<string, unknown>
  suggestions?: string[]
  wasHelpful?: boolean
  createdAt: string
}

export interface AIConversation {
  id: string
  sessionId: string
  createdAt: string
  preview: string
  messageCount: number
}

export interface AssistantResponse {
  message: string
  intent?: string
  entities?: Record<string, unknown>
  action?: {
    type: string
    data: Record<string, unknown>
  }
  confirmationRequired?: boolean
  suggestions?: string[]
  conversationId: string
  messageId: string
  responseTime: number
}

interface UseAssistantChatReturn {
  messages: AIMessage[]
  conversations: AIConversation[]
  currentConversationId: string | null
  isLoading: boolean
  isSending: boolean
  sendMessage: (content: string) => Promise<void>
  startNewConversation: () => void
  loadConversation: (conversationId: string) => Promise<void>
  submitFeedback: (messageId: string, wasHelpful: boolean, correction?: string) => Promise<void>
}

export function useAssistantChat(): UseAssistantChatReturn {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  // BREADCRUMB: Fetch conversation history on mount
  useEffect(() => {
    if (!currentUser?.stableId) {
      setIsLoading(false)
      return
    }

    async function fetchConversations() {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select(`
          id,
          session_id,
          created_at,
          ai_messages (content, role)
        `)
        .eq("stable_id", currentUser!.stableId)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Failed to fetch conversations:", error)
        setIsLoading(false)
        return
      }

      const convs: AIConversation[] = (data || []).map((conv) => {
        const msgs = conv.ai_messages as { content: string; role: string }[]
        const firstUserMsg = msgs?.find((m) => m.role === "user")
        return {
          id: conv.id,
          sessionId: conv.session_id,
          createdAt: conv.created_at,
          preview: firstUserMsg?.content?.slice(0, 50) || "New conversation",
          messageCount: msgs?.length || 0,
        }
      })

      setConversations(convs)
      setIsLoading(false)
    }

    fetchConversations()
  }, [currentUser?.stableId, supabase])

  // BREADCRUMB: Load messages for a specific conversation
  const loadConversation = useCallback(
    async (conversationId: string) => {
      if (!currentUser?.stableId) return

      setIsLoading(true)
      const { data, error } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Failed to load conversation:", error)
        setIsLoading(false)
        return
      }

      const msgs: AIMessage[] = (data || []).map((m) => ({
        id: m.id,
        conversationId: m.conversation_id,
        role: m.role as "user" | "assistant",
        content: m.content,
        actionType: m.action_type,
        actionData: m.action_data,
        wasHelpful: m.was_helpful,
        createdAt: m.created_at,
      }))

      setMessages(msgs)
      setCurrentConversationId(conversationId)
      setIsLoading(false)
    },
    [currentUser?.stableId, supabase]
  )

  // BREADCRUMB: Start a new conversation
  const startNewConversation = useCallback(() => {
    setMessages([])
    setCurrentConversationId(null)
  }, [])

  // BREADCRUMB: Send message to AI assistant
  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentUser?.stableId || !content.trim()) return

      setIsSending(true)

      // Optimistically add user message
      const tempUserMsg: AIMessage = {
        id: `temp-${Date.now()}`,
        conversationId: currentConversationId || "new",
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, tempUserMsg])

      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            conversationId: currentConversationId,
            stableId: currentUser.stableId,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }

        const data: AssistantResponse = await response.json()

        // Update conversation ID if new
        if (!currentConversationId) {
          setCurrentConversationId(data.conversationId)
        }

        // Add assistant response
        const assistantMsg: AIMessage = {
          id: data.messageId,
          conversationId: data.conversationId,
          role: "assistant",
          content: data.message,
          actionType: data.action?.type,
          actionData: data.action?.data,
          suggestions: data.suggestions,
          createdAt: new Date().toISOString(),
        }

        setMessages((prev) => {
          // Replace temp user message with real one and add assistant response
          const filtered = prev.filter((m) => m.id !== tempUserMsg.id)
          return [
            ...filtered,
            { ...tempUserMsg, id: `user-${Date.now()}`, conversationId: data.conversationId },
            assistantMsg,
          ]
        })

        // Refresh conversations list
        const { data: convData } = await supabase
          .from("ai_conversations")
          .select("id, session_id, created_at")
          .eq("stable_id", currentUser.stableId)
          .order("created_at", { ascending: false })
          .limit(20)

        if (convData) {
          // Simple refresh - just update the list
          setConversations((prev) => {
            const existing = prev.find((c) => c.id === data.conversationId)
            if (existing) {
              return prev.map((c) =>
                c.id === data.conversationId ? { ...c, messageCount: c.messageCount + 2 } : c
              )
            }
            return [
              {
                id: data.conversationId,
                sessionId: "",
                createdAt: new Date().toISOString(),
                preview: content.slice(0, 50),
                messageCount: 2,
              },
              ...prev,
            ]
          })
        }
      } catch (err) {
        console.error("Send message error:", err)
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id))
      } finally {
        setIsSending(false)
      }
    },
    [currentUser?.stableId, currentConversationId, supabase]
  )

  // BREADCRUMB: Submit feedback for a message
  const submitFeedback = useCallback(
    async (messageId: string, wasHelpful: boolean, correction?: string) => {
      if (!currentUser?.stableId) return

      // Update local state
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, wasHelpful } : m))
      )

      // Update in database
      await supabase.from("ai_messages").update({ was_helpful: wasHelpful }).eq("id", messageId)

      // If not helpful and has correction, save training feedback
      if (!wasHelpful && correction) {
        const msg = messages.find((m) => m.id === messageId)
        if (msg) {
          await supabase.from("ai_training_feedback").insert({
            message_id: messageId,
            stable_id: currentUser.stableId,
            original_input: msg.content,
            actual_action: msg.actionType,
            was_correct: false,
            correction_note: correction,
          })
        }
      }
    },
    [currentUser?.stableId, messages, supabase]
  )

  return {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    isSending,
    sendMessage,
    startNewConversation,
    loadConversation,
    submitFeedback,
  }
}
