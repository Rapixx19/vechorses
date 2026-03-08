/**
 * FILE: app/api/assistant/route.ts
 * ZONE: Yellow
 * PURPOSE: Comprehensive AI Assistant API - handles ALL stable operations
 * EXPORTS: POST
 * DEPENDS ON: @anthropic-ai/sdk, @supabase/supabase-js
 * CONSUMED BY: modules/assistant/hooks/useAssistantChat.ts
 * TESTS: app/api/assistant/route.test.ts
 * LAST CHANGED: 2026-03-08 — Full CRUD, multilingual, memory system
 */

import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"

// ═══════════════════════════════════════════════════════════════════
// CLIENT FACTORIES
// ═══════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface RequestBody {
  message: string
  conversationId: string | null
  stableId: string
}

interface StableContext {
  stableName: string
  today: string
  dayOfWeek: string
  horses: Array<{
    id: string
    name: string
    breed: string
    stallLabel?: string
    ownerName?: string
  }>
  clients: Array<{
    id: string
    full_name: string
    email: string
    phone?: string
  }>
  staff: Array<{
    id: string
    full_name: string
    role: string
    status_detail?: string
  }>
  services: Array<{
    id: string
    name: string
    price: number
    currency: string
    category: string
  }>
  stalls: Array<{
    id: string
    label: string
    type: string
    horseName?: string
  }>
  pendingTasks: Array<{
    id: string
    title: string
    assigneeName?: string
    due_date?: string
    due_time?: string
    priority: string
  }>
  upcomingEvents: Array<{
    id: string
    title: string
    start_time: string
    category: string
  }>
  invoices: Array<{
    id: string
    invoice_number: string
    clientName?: string
    total: number
    status: string
  }>
  documents: Array<{
    id: string
    title: string
    category: string
    expiry_date?: string
    ai_summary?: string
  }>
  memory: Array<{
    key: string
    value: string
    memory_type: string
  }>
}

// ═══════════════════════════════════════════════════════════════════
// FULL CONTEXT LOADER - Fetches EVERYTHING
// ═══════════════════════════════════════════════════════════════════

async function getFullStableContext(stableId: string): Promise<StableContext> {
  const supabaseAdmin = getSupabaseAdmin()
  const today = new Date().toISOString().split("T")[0]

  const [
    stableRes,
    horsesRes,
    clientsRes,
    staffRes,
    servicesRes,
    stallsRes,
    tasksRes,
    eventsRes,
    invoicesRes,
    documentsRes,
    memoryRes,
  ] = await Promise.all([
    // Stable info
    supabaseAdmin.from("stables").select("stable_name").eq("id", stableId).single(),
    // Horses with stall info
    supabaseAdmin
      .from("horses")
      .select("id, name, breed, stall_id, owner_id, stalls(label), clients(full_name)")
      .eq("stable_id", stableId)
      .eq("is_active", true)
      .limit(100),
    // Clients
    supabaseAdmin
      .from("clients")
      .select("id, full_name, email, phone")
      .eq("stable_id", stableId)
      .eq("is_active", true)
      .limit(100),
    // Staff/Team members
    supabaseAdmin
      .from("team_members")
      .select("id, full_name, role, status_detail")
      .eq("stable_id", stableId)
      .eq("is_active", true)
      .limit(50),
    // Services
    supabaseAdmin
      .from("services")
      .select("id, name, price, currency, category")
      .eq("stable_id", stableId)
      .eq("is_active", true)
      .limit(50),
    // Stalls with horse info
    supabaseAdmin
      .from("stalls")
      .select("id, label, type, horse_id, horses(name)")
      .eq("stable_id", stableId)
      .limit(100),
    // Pending tasks
    supabaseAdmin
      .from("staff_tasks")
      .select("id, title, status, due_date, due_time, priority, assigned_to, team_members(full_name)")
      .eq("stable_id", stableId)
      .in("status", ["pending", "in-progress"])
      .gte("due_date", today)
      .order("due_date")
      .limit(50),
    // Upcoming events
    supabaseAdmin
      .from("calendar_events")
      .select("id, title, category, start_time, end_time")
      .eq("stable_id", stableId)
      .gte("start_time", today)
      .order("start_time")
      .limit(30),
    // Recent invoices
    supabaseAdmin
      .from("invoices")
      .select("id, invoice_number, status, total, client_id, clients(full_name)")
      .eq("stable_id", stableId)
      .order("created_at", { ascending: false })
      .limit(20),
    // Documents
    supabaseAdmin
      .from("documents")
      .select("id, title, category, expiry_date, ai_summary, tags")
      .eq("stable_id", stableId)
      .limit(100),
    // AI Memory
    supabaseAdmin
      .from("ai_memory")
      .select("key, value, memory_type")
      .eq("stable_id", stableId)
      .order("times_referenced", { ascending: false })
      .limit(30),
  ])

  const now = new Date()

  return {
    stableName: stableRes.data?.stable_name || "your stable",
    today: now.toLocaleDateString("en-CA"),
    dayOfWeek: now.toLocaleDateString("en", { weekday: "long" }),
    horses:
      horsesRes.data?.map((h: Record<string, unknown>) => ({
        id: h.id as string,
        name: h.name as string,
        breed: h.breed as string,
        stallLabel: (h.stalls as { label?: string } | null)?.label,
        ownerName: (h.clients as { full_name?: string } | null)?.full_name,
      })) || [],
    clients: clientsRes.data || [],
    staff:
      staffRes.data?.map((s: Record<string, unknown>) => ({
        id: s.id as string,
        full_name: s.full_name as string,
        role: s.role as string,
        status_detail: s.status_detail as string | undefined,
      })) || [],
    services: servicesRes.data || [],
    stalls:
      stallsRes.data?.map((s: Record<string, unknown>) => ({
        id: s.id as string,
        label: s.label as string,
        type: s.type as string,
        horseName: (s.horses as { name?: string } | null)?.name,
      })) || [],
    pendingTasks:
      tasksRes.data?.map((t: Record<string, unknown>) => ({
        id: t.id as string,
        title: t.title as string,
        assigneeName: (t.team_members as { full_name?: string } | null)?.full_name,
        due_date: t.due_date as string | undefined,
        due_time: t.due_time as string | undefined,
        priority: t.priority as string,
      })) || [],
    upcomingEvents: eventsRes.data || [],
    invoices:
      invoicesRes.data?.map((i: Record<string, unknown>) => ({
        id: i.id as string,
        invoice_number: i.invoice_number as string,
        clientName: (i.clients as { full_name?: string } | null)?.full_name,
        total: i.total as number,
        status: i.status as string,
      })) || [],
    documents: documentsRes.data || [],
    memory: memoryRes.data || [],
  }
}

// ═══════════════════════════════════════════════════════════════════
// COMPREHENSIVE SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════════

function buildSystemPrompt(context: StableContext): string {
  return `You are the AI stable manager assistant for ${context.stableName}. You are smart, friendly, and handle EVERYTHING the stable owner needs. You understand commands in any language and ALWAYS respond in the SAME language the user wrote in.

═══════════════════════════════
MULTILINGUAL SUPPORT
═══════════════════════════════
Understand ALL these languages:
- English: "add a lesson for giulia"
- Italian: "aggiungi una lezione per giulia"
- German: "füge giulia eine Stunde hinzu"
- Spanish: "añade una lección para giulia"

Always respond in the SAME language the user wrote in.

TODAY: ${context.today} (${context.dayOfWeek})
STABLE: ${context.stableName}

═══════════════════════════════
STABLE DATA (use IDs for actions):
═══════════════════════════════

HORSES:
${context.horses.length > 0 ? context.horses.map((h) => `- ${h.name} (id:${h.id}) stall:${h.stallLabel || "none"} owner:${h.ownerName || "unassigned"} breed:${h.breed}`).join("\n") : "None registered"}

CLIENTS:
${context.clients.length > 0 ? context.clients.map((c) => `- ${c.full_name} (id:${c.id}) email:${c.email} phone:${c.phone || "none"}`).join("\n") : "None registered"}

STAFF:
${context.staff.length > 0 ? context.staff.map((s) => `- ${s.full_name} (id:${s.id}) role:${s.role} status:${s.status_detail || "working"}`).join("\n") : "None registered"}

SERVICES:
${context.services.length > 0 ? context.services.map((s) => `- ${s.name} (id:${s.id}) price:${s.price / 100} ${s.currency} category:${s.category}`).join("\n") : "None registered"}

STALLS:
${context.stalls.length > 0 ? context.stalls.map((s) => `- ${s.label} (id:${s.id}) type:${s.type} horse:${s.horseName || "empty"}`).join("\n") : "None registered"}

PENDING TASKS:
${context.pendingTasks.length > 0 ? context.pendingTasks.map((t) => `- ${t.title} (id:${t.id}) assigned:${t.assigneeName || "unassigned"} due:${t.due_date || "none"} ${t.due_time || ""} priority:${t.priority}`).join("\n") : "None pending"}

UPCOMING EVENTS:
${context.upcomingEvents.length > 0 ? context.upcomingEvents.map((e) => `- ${e.title} (id:${e.id}) ${e.start_time} category:${e.category}`).join("\n") : "None scheduled"}

RECENT INVOICES:
${context.invoices.length > 0 ? context.invoices.map((i) => `- ${i.invoice_number} (id:${i.id}) client:${i.clientName || "unknown"} total:${i.total / 100} status:${i.status}`).join("\n") : "None"}

DOCUMENTS:
${context.documents.length > 0 ? context.documents.map((d) => `- "${d.title}" (id:${d.id}) cat:${d.category} expiry:${d.expiry_date || "none"} ${d.ai_summary ? `summary:${d.ai_summary}` : ""}`).join("\n") : "None"}

MEMORY (things owner told you to remember):
${context.memory.length > 0 ? context.memory.map((m) => `- ${m.key}: ${m.value}`).join("\n") : "Nothing stored yet"}

═══════════════════════════════
AVAILABLE ACTIONS:
═══════════════════════════════

CALENDAR:
- ADD_CALENDAR_EVENT - Add event (lesson, vet, farrier, training, etc.)
- UPDATE_CALENDAR_EVENT - Reschedule or rename event
- DELETE_CALENDAR_EVENT - Remove event (ask confirmation first)
- LIST_EVENTS - Show schedule

TASKS:
- ASSIGN_TASK - Assign task to staff member
- UPDATE_TASK - Change task details
- COMPLETE_TASK - Mark task as done
- DELETE_TASK - Remove task
- REASSIGN_TASKS - Move all tasks from one staff to another
- LIST_TASKS - Show tasks

BILLING:
- CREATE_INVOICE - Create invoice for a client
- UPDATE_INVOICE_STATUS - Mark as paid/sent/draft/cancelled
- ADD_LINE_ITEM - Add service to invoice
- REMOVE_LINE_ITEM - Remove from invoice
- LIST_INVOICES - Show invoices
- GET_CLIENT_BALANCE - What client owes

CLIENTS:
- ADD_CLIENT - Register new client
- UPDATE_CLIENT - Update client info
- GET_CLIENT_INFO - Show client details
- LIST_CLIENTS - Show all clients

HORSES:
- ADD_HORSE - Register new horse
- UPDATE_HORSE - Update horse info (stall, owner, details)
- GET_HORSE_INFO - Show horse details
- ASSIGN_HORSE_TO_STALL - Move horse to stall
- LIST_HORSES - Show all horses

STAFF:
- UPDATE_STAFF_STATUS - Set working/sick/vacation/day-off
- GET_STAFF_INFO - Show staff details
- LIST_STAFF_STATUS - Show who's working

DOCUMENTS:
- FIND_DOCUMENT - Search by title or description
- LIST_DOCUMENTS - Show by category
- GET_DOCUMENT_INFO - Show document details
- ALERT_EXPIRING_DOCS - Show expiring documents

MEMORY:
- REMEMBER - Store a fact/preference/reminder
- RECALL - Retrieve stored memory
- FORGET - Delete a memory

INFO:
- SHOW_INFO - Show any entity details
- LIST_ITEMS - List any entity type
- NAVIGATE - Suggest navigation to a page

═══════════════════════════════
COMMAND EXAMPLES:
═══════════════════════════════

BILLING:
"create invoice for john for this month"
"add boarding service to giulia's invoice"
"remove the grooming from john's last invoice"
"mark invoice 2024-003 as paid"
"what does giulia owe?"
Italian: "crea fattura per giulia"
German: "rechnung für john erstellen"

SERVICES:
"add monthly boarding to john's services"
"change the lesson price to 80 euros"
"what services does john get?"

CLIENT INFO:
"what is john's phone number?"
"show me giulia's details"
"what horses does john have?"

DOCUMENTS:
"find bella's vaccination certificate"
"show all expiring documents"
"find the boarding contract for john"
Italian: "trova il certificato vaccinale di bella"

MEMORY:
"remember that bella needs special feed"
"remember dr rossi is our vet, 333123"
"what do you remember about giulia?"
"forget the note about bella's feed"

TASKS:
"give marco the morning feeding tomorrow"
"assign stall cleaning to anna today"
"mark all of marco's tasks as done"
"reassign all anna's tasks to giulia she called in sick"

STAFF:
"marco is sick"
"anna is on vacation until friday"
"who is working today?"

═══════════════════════════════
RESPONSE FORMAT:
═══════════════════════════════

ALWAYS return ONLY valid JSON with this structure:
{
  "message": "Brief friendly response in user's language",
  "language": "en|it|de|es",
  "intent": "billing|scheduling|task|client|horse|staff|document|memory|query|unknown",
  "entities": {
    "personName": null,
    "horseName": null,
    "date": null,
    "time": null,
    "amount": null,
    "serviceType": null,
    "documentType": null
  },
  "action": {
    "type": "ACTION_TYPE or null",
    "data": {}
  },
  "memoryAction": null,
  "displayData": null,
  "confirmationRequired": false,
  "undoable": true,
  "suggestions": ["Follow-up 1", "Follow-up 2"]
}

For memory actions, include:
"memoryAction": {
  "type": "remember|recall|forget",
  "memoryType": "preference|fact|reminder|alias|note",
  "key": "memory_key",
  "value": "memory_value"
}

For display data (client info, documents, etc.):
"displayData": {
  "type": "client_info|horse_info|documents|invoices|tasks|memories|balance",
  "data": { ... }
}

IMPORTANT RULES:
1. ALWAYS respond in the SAME language the user wrote in
2. For deletes, set confirmationRequired: true
3. Use entity IDs from the data above for actions
4. Be brief (1-2 sentences max)
5. Suggest next logical action
6. If unsure about a name, list closest matches`
}

// ═══════════════════════════════════════════════════════════════════
// CONVERSATION HISTORY
// ═══════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════
// MEMORY ACTIONS
// ═══════════════════════════════════════════════════════════════════

async function handleMemoryAction(
  stableId: string,
  memoryAction: { type: string; memoryType?: string; key: string; value?: string }
): Promise<string> {
  const supabaseAdmin = getSupabaseAdmin()

  switch (memoryAction.type) {
    case "remember":
      await supabaseAdmin.from("ai_memory").upsert(
        {
          stable_id: stableId,
          memory_type: memoryAction.memoryType || "fact",
          key: memoryAction.key,
          value: memoryAction.value || "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stable_id,memory_type,key" }
      )
      return "memory_stored"

    case "forget":
      await supabaseAdmin.from("ai_memory").delete().eq("stable_id", stableId).eq("key", memoryAction.key)
      return "memory_deleted"

    case "recall":
      // Just return - the memory was already fetched in context
      return "memory_recalled"

    default:
      return "no_action"
  }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN API HANDLER
// ═══════════════════════════════════════════════════════════════════

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

    // Get full context and history in parallel
    const [context, history] = await Promise.all([
      getFullStableContext(stableId),
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
    interface ParsedResponse {
      message: string
      language?: string
      intent?: string
      entities?: Record<string, unknown>
      action?: { type: string; data: Record<string, unknown> }
      memoryAction?: { type: string; memoryType?: string; key: string; value?: string }
      displayData?: { type: string; data: unknown }
      confirmationRequired?: boolean
      undoable?: boolean
      suggestions?: string[]
    }

    let parsed: ParsedResponse

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

    // Handle memory actions if present
    if (parsed.memoryAction) {
      await handleMemoryAction(stableId, parsed.memoryAction)
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Assistant API error:", errorMessage, error)
    return NextResponse.json({ error: "Failed to process request", details: errorMessage }, { status: 500 })
  }
}
