/**
 * FILE: modules/assistant/index.ts
 * ZONE: Yellow
 * PURPOSE: Barrel export for assistant module
 * EXPORTS: All assistant components and hooks
 * DEPENDS ON: ./components/*, ./hooks/*
 * CONSUMED BY: app/assistant/page.tsx
 * TESTS: None (barrel file)
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

export { AssistantPage } from "./components/AssistantPage"
export { ChatWindow } from "./components/ChatWindow"
export { MessageBubble } from "./components/MessageBubble"
export { ActionCard } from "./components/ActionCard"
export { SuggestionChips } from "./components/SuggestionChips"
export { ConversationHistory } from "./components/ConversationHistory"
export { useAssistantChat } from "./hooks/useAssistantChat"
