/**
 * FILE: app/api/assistant/route.ts
 * ZONE: Yellow
 * PURPOSE: AI Assistant API endpoint using Claude
 * EXPORTS: POST
 * DEPENDS ON: @anthropic-ai/sdk, lib/supabase-admin
 * CONSUMED BY: modules/assistant/hooks/useAssistantChat.ts
 * TESTS: app/api/assistant/route.test.ts
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"

// BREADCRUMB: Lazy client creation to avoid build-time errors
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getAnthropic() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
}

interface RequestBody {
  message: string
  conversationId: string | null
  stableId: string
}

// BREADCRUMB: Fetch stable context for system prompt
async function getStableContext(stableId: string) {
  const supabaseAdmin = getSupabaseAdmin()
  const [stableRes, horsesRes, clientsRes, staffRes, eventsRes] = await Promise.all([
    supabaseAdmin.from("stables").select("*").eq("id", stableId).single(),
    supabaseAdmin.from("horses").select("id, name, breed").eq("stable_id", stableId).eq("is_active", true).limit(50),
    supabaseAdmin.from("clients").select("id, full_name, email").eq("stable_id", stableId).eq("is_active", true).limit(50),
    supabaseAdmin.from("team_members").select("id, full_name, role").eq("stable_id", stableId).eq("is_active", true).limit(20),
    supabaseAdmin.from("calendar_events").select("id, title, start_time, category").eq("stable_id", stableId).gte("start_time", new Date().toISOString()).limit(20),
  ])

  return {
    stable: stableRes.data,
    horses: horsesRes.data || [],
    clients: clientsRes.data || [],
    staff: staffRes.data || [],
    upcomingEvents: eventsRes.data || [],
  }
}

// BREADCRUMB: Build comprehensive system prompt
function buildSystemPrompt(context: Awaited<ReturnType<typeof getStableContext>>) {
  const stableName = context.stable?.stable_name || "your stable"

  return `You are a smart stable management AI assistant for ${stableName}. You are friendly, concise, and understand casual commands in any language.

CURRENT STABLE DATA:
- Horses: ${context.horses.map((h) => h.name).join(", ") || "None registered"}
- Clients: ${context.clients.map((c) => c.full_name).join(", ") || "None registered"}
- Staff: ${context.staff.map((s) => `${s.full_name} (${s.role})`).join(", ") || "None registered"}
- Upcoming events: ${context.upcomingEvents.length} scheduled

TODAY: ${new Date().toISOString().split("T")[0]}

UNDERSTAND THESE PATTERNS:

SCHEDULING (any of these means add event):
- "add a lesson to giulia"
- "giulia has a lesson friday"
- "book vet for bella tomorrow 3pm"
- "schedule farrier next tuesday"
- "marco has training monday morning"

QUICK STATUS:
- "marco is sick" → set sick leave today
- "anna vacation next week" → set vacation
- "giulia is back" → set working

LOOKUPS:
- "show bella's vet records"
- "what documents are expiring"
- "show pending tasks"
- "who is working today"

BILLING:
- "create invoice for john this month"
- "mark john's invoice as paid"

ALWAYS:
1. Confirm exactly what you did
2. Be brief (1-2 sentences max)
3. Suggest next logical action
4. If unsure about a name, list closest matches
5. For deletes always ask for confirmation first

You MUST return valid JSON with this exact structure:
{
  "message": "Brief friendly confirmation or response",
  "intent": "schedule_event|add_client|update_status|find_document|create_task|create_invoice|query|unknown",
  "entities": {
    "personName": "name if mentioned",
    "horseName": "horse name if mentioned",
    "date": "YYYY-MM-DD if mentioned",
    "time": "HH:MM if mentioned",
    "serviceType": "lesson|vet|farrier|training|other"
  },
  "action": {
    "type": "ADD_CALENDAR_EVENT|ADD_CLIENT|UPDATE_STAFF_STATUS|FIND_DOCUMENT|CREATE_TASK|CREATE_INVOICE|null",
    "data": { "relevant": "data for the action" }
  },
  "confirmationRequired": false,
  "suggestions": ["Follow-up suggestion 1", "Follow-up suggestion 2"]
}`
}

// BREADCRUMB: Fetch conversation history for context
async function getConversationHistory(conversationId: string): Promise<{ role: "user" | "assistant"; content: string }[]> {
  const supabaseAdmin = getSupabaseAdmin()
  const { data } = await supabaseAdmin
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(10)

  return (data || []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { message, conversationId, stableId } = body

    if (!message || !stableId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const anthropic = getAnthropic()
    const startTime = Date.now()

    // Create or get conversation
    let convId = conversationId
    if (!convId) {
      const { data: newConv, error: convError } = await supabaseAdmin
        .from("ai_conversations")
        .insert({ stable_id: stableId })
        .select()
        .single()

      if (convError) {
        console.error("Failed to create conversation:", convError)
        return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
      }
      convId = newConv.id
    }

    // Save user message
    await supabaseAdmin.from("ai_messages").insert({
      conversation_id: convId,
      stable_id: stableId,
      role: "user",
      content: message,
    })

    // Get context and history
    const [context, history] = await Promise.all([
      getStableContext(stableId),
      conversationId ? getConversationHistory(conversationId) : Promise.resolve([]),
    ])

    // Call Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: buildSystemPrompt(context),
      messages: [
        ...history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: message },
      ],
    })

    const responseTime = Date.now() - startTime

    // Parse response
    let parsed: {
      message: string
      intent?: string
      entities?: Record<string, unknown>
      action?: { type: string; data: Record<string, unknown> }
      confirmationRequired?: boolean
      suggestions?: string[]
    }

    try {
      const textContent = response.content[0]
      if (textContent.type === "text") {
        // Try to extract JSON from the response
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0])
        } else {
          parsed = { message: textContent.text, suggestions: [] }
        }
      } else {
        parsed = { message: "I couldn't process that request.", suggestions: [] }
      }
    } catch {
      // If JSON parsing fails, use the raw text
      const textContent = response.content[0]
      parsed = {
        message: textContent.type === "text" ? textContent.text : "I couldn't process that request.",
        suggestions: [],
      }
    }

    // Save assistant message
    const { data: msgData, error: msgError } = await supabaseAdmin
      .from("ai_messages")
      .insert({
        conversation_id: convId,
        stable_id: stableId,
        role: "assistant",
        content: parsed.message,
        action_type: parsed.action?.type || null,
        action_data: parsed.action?.data || null,
        intent_detected: parsed.intent || null,
        entities_detected: parsed.entities || null,
        response_time_ms: responseTime,
      })
      .select()
      .single()

    if (msgError) {
      console.error("Failed to save assistant message:", msgError)
    }

    return NextResponse.json({
      ...parsed,
      conversationId: convId,
      messageId: msgData?.id || "",
      responseTime,
    })
  } catch (error) {
    console.error("Assistant API error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
