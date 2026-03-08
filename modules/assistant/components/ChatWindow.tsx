/**
 * FILE: modules/assistant/components/ChatWindow.tsx
 * ZONE: Green
 * PURPOSE: Main chat window with messages, input, and voice support
 * EXPORTS: ChatWindow
 * DEPENDS ON: lucide-react, MessageBubble
 * CONSUMED BY: AssistantPage
 * TESTS: modules/assistant/tests/ChatWindow.test.tsx
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, Loader2, Trash2, Calendar, UserPlus, FileText, CheckSquare, Bot } from "lucide-react"
import { MessageBubble } from "./MessageBubble"
import type { AIMessage } from "../hooks/useAssistantChat"

interface ChatWindowProps {
  messages: AIMessage[]
  isSending: boolean
  onSendMessage: (content: string) => void
  onFeedback: (messageId: string, wasHelpful: boolean, correction?: string) => void
  onClear: () => void
}

// BREADCRUMB: Quick action cards for empty state
const quickActions = [
  {
    icon: Calendar,
    title: "Add Event",
    description: "Schedule a lesson or vet visit",
    starter: "Schedule a lesson for ",
  },
  {
    icon: UserPlus,
    title: "Add Client",
    description: "Register a new horse owner",
    starter: "Add a new client named ",
  },
  {
    icon: FileText,
    title: "Find Documents",
    description: "Find or upload documents",
    starter: "Find documents for ",
  },
  {
    icon: CheckSquare,
    title: "Create Task",
    description: "Assign tasks to your team",
    starter: "Create a task for ",
  },
]

export function ChatWindow({
  messages,
  isSending,
  onSendMessage,
  onFeedback,
  onClear,
}: ChatWindowProps) {
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // BREADCRUMB: Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return
    onSendMessage(input.trim())
    setInput("")
  }

  const handleQuickAction = (starter: string) => {
    setInput(starter)
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion)
  }

  // BREADCRUMB: Web Speech API for voice input
  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input is not supported in this browser")
      return
    }

    const SpeechRecognition = (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      // Auto-send after voice input
      setTimeout(() => {
        onSendMessage(transcript)
        setInput("")
      }, 100)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2C5F2E] flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Stable Assistant</h2>
            <p className="text-xs text-[var(--text-muted)]">Ask me anything about your stable</p>
          </div>
        </div>
        {!isEmpty && (
          <button
            onClick={onClear}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
            title="Clear chat"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-6">&#128052;</div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              What can I help you with?
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-8">
              Ask me to schedule events, add clients, find documents, and more
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md w-full">
              {quickActions.map((action, idx) => {
                const Icon = action.icon
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.starter)}
                    className="p-4 rounded-xl bg-[#252538] border border-[var(--border)] hover:border-[#2C5F2E] transition-colors text-left"
                  >
                    <Icon className="h-5 w-5 text-[#2C5F2E] mb-2" />
                    <p className="text-sm font-medium text-[var(--text-primary)]">{action.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{action.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                id={msg.id}
                role={msg.role}
                content={msg.content}
                actionType={msg.actionType}
                actionData={msg.actionData}
                suggestions={msg.suggestions}
                wasHelpful={msg.wasHelpful}
                onFeedback={onFeedback}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-[var(--text-muted)] mb-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-4 border-t border-[var(--border)]"
      >
        <button
          type="button"
          onClick={startVoiceInput}
          className={`p-3 rounded-lg transition-colors ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          }`}
          title="Voice input"
        >
          <Mic className="h-5 w-5" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your stable..."
          className="flex-1 px-4 py-3 rounded-lg bg-[#252538] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="p-3 rounded-lg bg-[#2C5F2E] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a7a3d] transition-colors"
        >
          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </form>
    </div>
  )
}

// BREADCRUMB: SpeechRecognition type for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  readonly isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
  start(): void
  stop(): void
  abort(): void
}
