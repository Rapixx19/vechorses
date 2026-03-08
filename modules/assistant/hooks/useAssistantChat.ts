/**
 * FILE: modules/assistant/hooks/useAssistantChat.ts
 * ZONE: Yellow
 * PURPOSE: Hook for AI assistant chat state, API calls, and CRUD action execution
 * EXPORTS: useAssistantChat
 * DEPENDS ON: lib/supabase.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: AssistantPage, ChatWindow
 * TESTS: modules/assistant/tests/useAssistantChat.test.ts
 * LAST CHANGED: 2026-03-08 — Full CRUD action executor, multilingual, display data
 */

"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface AIMessage {
  id: string
  conversationId: string
  role: "user" | "assistant"
  content: string
  language?: string
  actionType?: string
  actionData?: Record<string, unknown>
  displayData?: DisplayData
  suggestions?: string[]
  wasHelpful?: boolean
  confirmationRequired?: boolean
  undoable?: boolean
  createdAt: string
}

export interface DisplayData {
  type: "client_info" | "horse_info" | "documents" | "invoices" | "tasks" | "memories" | "balance" | "events" | "staff"
  data: unknown
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
  language?: string
  intent?: string
  entities?: Record<string, unknown>
  action?: {
    type: string
    data: Record<string, unknown>
  }
  memoryAction?: {
    type: string
    memoryType?: string
    key: string
    value?: string
  }
  displayData?: DisplayData
  confirmationRequired?: boolean
  undoable?: boolean
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
  userLanguage: string
  sendMessage: (content: string) => Promise<void>
  startNewConversation: () => void
  loadConversation: (conversationId: string) => Promise<void>
  submitFeedback: (messageId: string, wasHelpful: boolean, correction?: string) => Promise<void>
  executeAction: (action: { type: string; data: Record<string, unknown> }) => Promise<string>
  setUserLanguage: (lang: string) => void
}

// ═══════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════

export function useAssistantChat(): UseAssistantChatReturn {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [userLanguage, setUserLanguage] = useState<string>("en")

  const supabase = useMemo(() => createClient(), [])

  // BREADCRUMB: Load saved language preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("assistant-language")
      if (saved) setUserLanguage(saved)
    }
  }, [])

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

  // ═══════════════════════════════════════════════════════════════════
  // ACTION EXECUTOR - Handles ALL CRUD operations
  // ═══════════════════════════════════════════════════════════════════

  const executeAction = useCallback(
    async (action: { type: string; data: Record<string, unknown> }): Promise<string> => {
      if (!currentUser?.stableId) return "Not authenticated"
      const stableId = currentUser.stableId

      try {
        switch (action.type) {
          // ── CALENDAR ──────────────────────────────────────────────
          case "ADD_CALENDAR_EVENT": {
            const { data: event } = await supabase
              .from("calendar_events")
              .insert({
                stable_id: stableId,
                title: action.data.title,
                description: action.data.description,
                start_time: action.data.startTime,
                end_time: action.data.endTime,
                category: action.data.category || "general",
                horse_id: action.data.horseId,
                all_day: action.data.allDay || false,
                color: action.data.color || "#2C5F2E",
              })
              .select()
              .single()
            return event ? `Event "${event.title}" created` : "Event created"
          }

          case "UPDATE_CALENDAR_EVENT": {
            await supabase
              .from("calendar_events")
              .update({
                title: action.data.title,
                start_time: action.data.startTime,
                end_time: action.data.endTime,
                description: action.data.description,
              })
              .eq("id", action.data.eventId)
              .eq("stable_id", stableId)
            return "Event updated"
          }

          case "DELETE_CALENDAR_EVENT": {
            await supabase
              .from("calendar_events")
              .delete()
              .eq("id", action.data.eventId)
              .eq("stable_id", stableId)
            return "Event deleted"
          }

          // ── TASKS ─────────────────────────────────────────────────
          case "ASSIGN_TASK": {
            const { data: task } = await supabase
              .from("staff_tasks")
              .insert({
                stable_id: stableId,
                title: action.data.title,
                description: action.data.description,
                assigned_to: action.data.assignedTo,
                due_date: action.data.dueDate,
                due_time: action.data.dueTime,
                priority: action.data.priority || "medium",
                category: action.data.category || "general",
                status: "pending",
              })
              .select()
              .single()
            return task ? `Task "${task.title}" assigned` : "Task created"
          }

          case "UPDATE_TASK": {
            await supabase
              .from("staff_tasks")
              .update({
                title: action.data.title,
                description: action.data.description,
                due_date: action.data.dueDate,
                priority: action.data.priority,
              })
              .eq("id", action.data.taskId)
              .eq("stable_id", stableId)
            return "Task updated"
          }

          case "COMPLETE_TASK": {
            await supabase
              .from("staff_tasks")
              .update({
                status: "completed",
                completed_at: new Date().toISOString(),
              })
              .eq("id", action.data.taskId)
              .eq("stable_id", stableId)
            return "Task marked as completed"
          }

          case "DELETE_TASK": {
            await supabase
              .from("staff_tasks")
              .delete()
              .eq("id", action.data.taskId)
              .eq("stable_id", stableId)
            return "Task deleted"
          }

          case "REASSIGN_TASKS": {
            await supabase
              .from("staff_tasks")
              .update({ assigned_to: action.data.toStaffId })
              .eq("assigned_to", action.data.fromStaffId)
              .eq("stable_id", stableId)
              .in("status", ["pending", "in-progress"])
            return "Tasks reassigned"
          }

          // ── BILLING ───────────────────────────────────────────────
          case "CREATE_INVOICE": {
            // Get next invoice number
            const { data: lastInvoice } = await supabase
              .from("invoices")
              .select("invoice_number")
              .eq("stable_id", stableId)
              .order("created_at", { ascending: false })
              .limit(1)
              .single()

            const lastNum = lastInvoice?.invoice_number?.match(/\d+$/)
            const nextNum = lastNum ? parseInt(lastNum[0]) + 1 : 1
            const invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextNum).padStart(4, "0")}`

            const { data: invoice } = await supabase
              .from("invoices")
              .insert({
                stable_id: stableId,
                client_id: action.data.clientId,
                invoice_number: invoiceNumber,
                status: "draft",
                issued_date: new Date().toISOString(),
                due_date: action.data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currency: action.data.currency || "EUR",
                subtotal: 0,
                total: 0,
                notes: action.data.notes,
              })
              .select()
              .single()
            return invoice ? `Invoice ${invoice.invoice_number} created` : "Invoice created"
          }

          case "UPDATE_INVOICE_STATUS": {
            const updates: Record<string, unknown> = { status: action.data.status }
            if (action.data.status === "paid") {
              updates.paid_date = new Date().toISOString()
            }
            await supabase
              .from("invoices")
              .update(updates)
              .eq("id", action.data.invoiceId)
              .eq("stable_id", stableId)
            return `Invoice marked as ${action.data.status}`
          }

          case "ADD_LINE_ITEM": {
            await supabase.from("billing_line_items").insert({
              stable_id: stableId,
              invoice_id: action.data.invoiceId,
              description: action.data.description,
              quantity: action.data.quantity || 1,
              amount_cents: action.data.amountCents,
              service_type: action.data.serviceType || "other",
              service_date: action.data.serviceDate || new Date().toISOString(),
              status: "invoiced",
            })
            // Recalculate invoice total
            const { data: items } = await supabase
              .from("billing_line_items")
              .select("amount_cents, quantity")
              .eq("invoice_id", action.data.invoiceId)
            const total = items?.reduce((sum, i) => sum + (i.amount_cents || 0) * (i.quantity || 1), 0) || 0
            await supabase
              .from("invoices")
              .update({ subtotal: total, total: total })
              .eq("id", action.data.invoiceId)
            return `Added ${action.data.description} to invoice`
          }

          case "REMOVE_LINE_ITEM": {
            await supabase.from("billing_line_items").delete().eq("id", action.data.lineItemId)
            // Recalculate invoice total
            if (action.data.invoiceId) {
              const { data: items } = await supabase
                .from("billing_line_items")
                .select("amount_cents, quantity")
                .eq("invoice_id", action.data.invoiceId)
              const total = items?.reduce((sum, i) => sum + (i.amount_cents || 0) * (i.quantity || 1), 0) || 0
              await supabase
                .from("invoices")
                .update({ subtotal: total, total: total })
                .eq("id", action.data.invoiceId)
            }
            return "Line item removed"
          }

          // ── CLIENTS ───────────────────────────────────────────────
          case "ADD_CLIENT": {
            const { data: client } = await supabase
              .from("clients")
              .insert({
                stable_id: stableId,
                full_name: action.data.fullName,
                email: action.data.email,
                phone: action.data.phone,
                notes: action.data.notes,
                is_active: true,
              })
              .select()
              .single()
            return client ? `Client "${client.full_name}" added` : "Client added"
          }

          case "UPDATE_CLIENT": {
            await supabase
              .from("clients")
              .update({
                full_name: action.data.fullName,
                email: action.data.email,
                phone: action.data.phone,
                notes: action.data.notes,
              })
              .eq("id", action.data.clientId)
              .eq("stable_id", stableId)
            return "Client updated"
          }

          // ── HORSES ────────────────────────────────────────────────
          case "ADD_HORSE": {
            const { data: horse } = await supabase
              .from("horses")
              .insert({
                stable_id: stableId,
                name: action.data.name,
                breed: action.data.breed,
                color: action.data.color,
                date_of_birth: action.data.dateOfBirth,
                owner_id: action.data.ownerId,
                stall_id: action.data.stallId,
                medical_notes: action.data.medicalNotes,
                feeding_notes: action.data.feedingNotes,
                is_active: true,
              })
              .select()
              .single()
            return horse ? `Horse "${horse.name}" added` : "Horse added"
          }

          case "UPDATE_HORSE": {
            await supabase
              .from("horses")
              .update({
                name: action.data.name,
                breed: action.data.breed,
                stall_id: action.data.stallId,
                owner_id: action.data.ownerId,
                medical_notes: action.data.medicalNotes,
                feeding_notes: action.data.feedingNotes,
              })
              .eq("id", action.data.horseId)
              .eq("stable_id", stableId)
            return "Horse updated"
          }

          case "ASSIGN_HORSE_TO_STALL": {
            // Clear old stall assignment
            await supabase
              .from("horses")
              .update({ stall_id: null })
              .eq("stall_id", action.data.stallId)
              .eq("stable_id", stableId)
            // Assign to new stall
            await supabase
              .from("horses")
              .update({ stall_id: action.data.stallId })
              .eq("id", action.data.horseId)
              .eq("stable_id", stableId)
            return "Horse assigned to stall"
          }

          // ── STAFF ─────────────────────────────────────────────────
          case "UPDATE_STAFF_STATUS": {
            await supabase
              .from("team_members")
              .update({
                status_detail: action.data.status,
                vacation_start: action.data.vacationStart,
                vacation_end: action.data.vacationEnd,
              })
              .eq("id", action.data.staffId)
              .eq("stable_id", stableId)
            return `Staff status updated to ${action.data.status}`
          }

          // ── MEMORY ────────────────────────────────────────────────
          case "REMEMBER": {
            await supabase.from("ai_memory").upsert(
              {
                stable_id: stableId,
                memory_type: action.data.memoryType || "fact",
                key: action.data.key,
                value: action.data.value,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "stable_id,memory_type,key" }
            )
            return "Memory stored"
          }

          case "FORGET": {
            await supabase
              .from("ai_memory")
              .delete()
              .eq("stable_id", stableId)
              .eq("key", action.data.key)
            return "Memory deleted"
          }

          default:
            return `Action ${action.type} not implemented`
        }
      } catch (err) {
        console.error("Action execution error:", err)
        return `Failed to execute action: ${err instanceof Error ? err.message : "Unknown error"}`
      }
    },
    [currentUser?.stableId, supabase]
  )

  // ═══════════════════════════════════════════════════════════════════
  // LOAD CONVERSATION
  // ═══════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════
  // START NEW CONVERSATION
  // ═══════════════════════════════════════════════════════════════════

  const startNewConversation = useCallback(() => {
    setMessages([])
    setCurrentConversationId(null)
  }, [])

  // ═══════════════════════════════════════════════════════════════════
  // SEND MESSAGE
  // ═══════════════════════════════════════════════════════════════════

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

        // Update language preference
        if (data.language && data.language !== userLanguage) {
          setUserLanguage(data.language)
          if (typeof window !== "undefined") {
            localStorage.setItem("assistant-language", data.language)
          }
        }

        // Execute action if present and no confirmation required
        let actionResult: string | undefined
        if (data.action?.type && !data.confirmationRequired) {
          actionResult = await executeAction(data.action)
        }

        // Add assistant response
        const assistantMsg: AIMessage = {
          id: data.messageId,
          conversationId: data.conversationId,
          role: "assistant",
          content: actionResult ? `${data.message}\n\n${actionResult}` : data.message,
          language: data.language,
          actionType: data.action?.type,
          actionData: data.action?.data,
          displayData: data.displayData,
          suggestions: data.suggestions,
          confirmationRequired: data.confirmationRequired,
          undoable: data.undoable,
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
    [currentUser?.stableId, currentConversationId, supabase, userLanguage, executeAction]
  )

  // ═══════════════════════════════════════════════════════════════════
  // SUBMIT FEEDBACK
  // ═══════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════

  return {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    isSending,
    userLanguage,
    sendMessage,
    startNewConversation,
    loadConversation,
    submitFeedback,
    executeAction,
    setUserLanguage,
  }
}
