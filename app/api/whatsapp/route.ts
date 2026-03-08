/**
 * FILE: app/api/whatsapp/route.ts
 * ZONE: Yellow
 * PURPOSE: WhatsApp webhook for Meta Cloud API - handles verification and messages
 * EXPORTS: GET, POST
 * DEPENDS ON: @supabase/supabase-js, @anthropic-ai/sdk
 * CONSUMED BY: Meta WhatsApp Cloud API webhooks
 * TESTS: app/api/whatsapp/route.test.ts
 * LAST CHANGED: 2026-03-08 — Initial WhatsApp bot implementation
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Anthropic from "@anthropic-ai/sdk"

// ═══════════════════════════════════════════════════════════════════
// LAZY CLIENTS
// ═══════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabaseAdmin: any = null
let _anthropic: Anthropic | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseAdmin(): any {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabaseAdmin
}

function getAnthropic() {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }
  return _anthropic
}

// ═══════════════════════════════════════════════════════════════════
// WHATSAPP API HELPERS
// ═══════════════════════════════════════════════════════════════════

async function sendMessage(to: string, text: string): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_TOKEN

  if (!phoneNumberId || !token) {
    console.error("WhatsApp credentials not configured")
    return false
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { body: text },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("WhatsApp send error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("WhatsApp send exception:", error)
    return false
  }
}

async function getMediaUrl(mediaId: string): Promise<string | null> {
  const token = process.env.WHATSAPP_TOKEN
  if (!token) return null

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${mediaId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    const data = await response.json()
    return data.url || null
  } catch {
    return null
  }
}

async function downloadMedia(url: string): Promise<ArrayBuffer | null> {
  const token = process.env.WHATSAPP_TOKEN
  if (!token) return null

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return await response.arrayBuffer()
  } catch {
    return null
  }
}

async function transcribeAudio(mediaId: string | null): Promise<string | null> {
  if (!mediaId) return null

  const mediaUrl = await getMediaUrl(mediaId)
  if (!mediaUrl) return null

  const audioData = await downloadMedia(mediaUrl)
  if (!audioData) return null

  // Use OpenAI Whisper API for transcription if available
  // For now, return null to indicate voice notes need typed fallback
  // In production, integrate with Whisper API
  console.log("Audio transcription not implemented yet")
  return null
}

// ═══════════════════════════════════════════════════════════════════
// ACTION EXECUTOR
// ═══════════════════════════════════════════════════════════════════

interface ActionResult {
  success: boolean
  message?: string
  data?: unknown
}

async function executeAction(
  action: { type: string; data: Record<string, unknown> },
  stableId: string
): Promise<ActionResult> {
  const supabase = getSupabaseAdmin()
  const { type, data } = action

  try {
    switch (type) {
      // ─────────────────────────────────────
      // CALENDAR EVENTS
      // ─────────────────────────────────────
      case "ADD_CALENDAR_EVENT": {
        const { data: event, error } = await supabase
          .from("calendar_events")
          .insert({
            stable_id: stableId,
            title: data.title,
            description: data.description,
            start_time: data.startTime,
            end_time: data.endTime,
            all_day: data.allDay || false,
            category: data.category || "general",
            color: data.color || "#2C5F2E",
            horse_id: data.horseId,
            assigned_to: data.assignedTo || [],
          })
          .select()
          .single()
        if (error) throw error
        return { success: true, message: "Event created", data: event }
      }

      case "LIST_EVENTS": {
        const { data: events, error } = await supabase
          .from("calendar_events")
          .select("id, title, start_time, category")
          .eq("stable_id", stableId)
          .gte("start_time", new Date().toISOString())
          .order("start_time")
          .limit(10)
        if (error) throw error
        return { success: true, data: events }
      }

      case "DELETE_CALENDAR_EVENT": {
        const { error } = await supabase
          .from("calendar_events")
          .delete()
          .eq("id", data.eventId)
          .eq("stable_id", stableId)
        if (error) throw error
        return { success: true, message: "Event deleted" }
      }

      // ─────────────────────────────────────
      // TASKS
      // ─────────────────────────────────────
      case "ASSIGN_TASK": {
        const { data: task, error } = await supabase
          .from("staff_tasks")
          .insert({
            stable_id: stableId,
            title: data.title,
            description: data.description,
            assigned_to: data.assignedTo,
            priority: data.priority || "medium",
            status: "pending",
            due_date: data.dueDate,
            category: data.category || "general",
            horse_id: data.horseId,
          })
          .select()
          .single()
        if (error) throw error
        return { success: true, message: "Task assigned", data: task }
      }

      case "COMPLETE_TASK": {
        const { error } = await supabase
          .from("staff_tasks")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", data.taskId)
          .eq("stable_id", stableId)
        if (error) throw error
        return { success: true, message: "Task completed" }
      }

      case "LIST_TASKS": {
        const query = supabase
          .from("staff_tasks")
          .select("id, title, status, due_date, assigned_to")
          .eq("stable_id", stableId)
          .order("due_date")
          .limit(15)

        if (data.status) {
          query.eq("status", data.status)
        }
        if (data.assignedTo) {
          query.eq("assigned_to", data.assignedTo)
        }

        const { data: tasks, error } = await query
        if (error) throw error
        return { success: true, data: tasks }
      }

      // ─────────────────────────────────────
      // STAFF
      // ─────────────────────────────────────
      case "UPDATE_STAFF_STATUS": {
        const { error } = await supabase
          .from("team_members")
          .update({
            status_detail: data.status,
            vacation_start: data.vacationStart,
            vacation_end: data.vacationEnd,
          })
          .eq("id", data.staffId)
          .eq("stable_id", stableId)
        if (error) throw error
        return { success: true, message: `Status updated to ${data.status}` }
      }

      case "GET_STAFF_INFO": {
        const { data: staff, error } = await supabase
          .from("team_members")
          .select("*")
          .eq("stable_id", stableId)
          .eq("is_active", true)
        if (error) throw error
        return { success: true, data: staff }
      }

      // ─────────────────────────────────────
      // CLIENTS
      // ─────────────────────────────────────
      case "ADD_CLIENT": {
        const { data: client, error } = await supabase
          .from("clients")
          .insert({
            stable_id: stableId,
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            notes: data.notes,
            is_active: true,
          })
          .select()
          .single()
        if (error) throw error
        return { success: true, message: "Client added", data: client }
      }

      case "GET_CLIENT_INFO": {
        const { data: client, error } = await supabase
          .from("clients")
          .select("*, horses(*)")
          .eq("id", data.clientId)
          .eq("stable_id", stableId)
          .single()
        if (error) throw error
        return { success: true, data: client }
      }

      case "GET_CLIENT_BALANCE": {
        const { data: invoices, error } = await supabase
          .from("invoices")
          .select("total, status")
          .eq("client_id", data.clientId)
          .eq("stable_id", stableId)

        if (error) throw error

        const invoiceList = invoices as { total: number; status: string }[] || []
        const total = invoiceList.reduce((sum: number, i) => sum + (i.total || 0), 0)
        const paid = invoiceList.filter((i) => i.status === "paid").reduce((sum: number, i) => sum + (i.total || 0), 0)
        const outstanding = total - paid

        return {
          success: true,
          data: { total, paid, outstanding, invoiceCount: invoiceList.length },
        }
      }

      case "LIST_CLIENTS": {
        const { data: clients, error } = await supabase
          .from("clients")
          .select("id, full_name, phone, email")
          .eq("stable_id", stableId)
          .eq("is_active", true)
        if (error) throw error
        return { success: true, data: clients }
      }

      // ─────────────────────────────────────
      // HORSES
      // ─────────────────────────────────────
      case "ADD_HORSE": {
        const { data: horse, error } = await supabase
          .from("horses")
          .insert({
            stable_id: stableId,
            name: data.name,
            breed: data.breed,
            color: data.color,
            date_of_birth: data.dateOfBirth,
            owner_id: data.ownerId,
            medical_notes: data.medicalNotes,
            feeding_notes: data.feedingNotes,
            is_active: true,
          })
          .select()
          .single()
        if (error) throw error
        return { success: true, message: "Horse added", data: horse }
      }

      case "GET_HORSE_INFO": {
        const { data: horse, error } = await supabase
          .from("horses")
          .select("*, clients(full_name), stalls(label)")
          .eq("id", data.horseId)
          .eq("stable_id", stableId)
          .single()
        if (error) throw error
        return { success: true, data: horse }
      }

      case "UPDATE_HORSE": {
        const updates: Record<string, unknown> = {}
        if (data.medicalNotes) updates.medical_notes = data.medicalNotes
        if (data.feedingNotes) updates.feeding_notes = data.feedingNotes
        if (data.stallId !== undefined) updates.stall_id = data.stallId

        const { error } = await supabase
          .from("horses")
          .update(updates)
          .eq("id", data.horseId)
          .eq("stable_id", stableId)
        if (error) throw error
        return { success: true, message: "Horse updated" }
      }

      // ─────────────────────────────────────
      // DOCUMENTS
      // ─────────────────────────────────────
      case "FIND_DOCUMENT": {
        let query = supabase
          .from("documents")
          .select("id, title, category, expiry_date, ai_summary")
          .eq("stable_id", stableId)

        if (data.category) {
          query = query.eq("category", data.category)
        }
        if (data.entityId) {
          query = query.eq("entity_id", data.entityId)
        }
        if (data.search) {
          query = query.or(`title.ilike.%${data.search}%,ai_summary.ilike.%${data.search}%`)
        }

        const { data: docs, error } = await query.limit(10)
        if (error) throw error
        return { success: true, data: docs }
      }

      case "LIST_DOCUMENTS": {
        const { data: docs, error } = await supabase
          .from("documents")
          .select("id, title, category, expiry_date, status")
          .eq("stable_id", stableId)
          .order("created_at", { ascending: false })
          .limit(20)
        if (error) throw error
        return { success: true, data: docs }
      }

      // ─────────────────────────────────────
      // INVOICES
      // ─────────────────────────────────────
      case "CREATE_INVOICE": {
        const { data: settings } = await supabase
          .from("stable_settings")
          .select("invoice_prefix, invoice_start_number, currency")
          .eq("stable_id", stableId)
          .single()

        const prefix = settings?.invoice_prefix || "INV"
        const startNum = settings?.invoice_start_number || 1

        const { count } = await supabase
          .from("invoices")
          .select("*", { count: "exact", head: true })
          .eq("stable_id", stableId)

        const invoiceNumber = `${prefix}-${String((count || 0) + startNum).padStart(4, "0")}`

        const { data: invoice, error } = await supabase
          .from("invoices")
          .insert({
            stable_id: stableId,
            invoice_number: invoiceNumber,
            client_id: data.clientId,
            recipient_type: "client",
            line_items: data.lineItems || [],
            subtotal: data.subtotal || 0,
            total: data.total || 0,
            status: "draft",
            issued_date: new Date().toISOString(),
            due_date: data.dueDate,
            currency: settings?.currency || "EUR",
          })
          .select()
          .single()
        if (error) throw error
        return { success: true, message: `Invoice ${invoiceNumber} created`, data: invoice }
      }

      case "UPDATE_INVOICE_STATUS": {
        const updates: Record<string, unknown> = { status: data.status }
        if (data.status === "paid") {
          updates.paid_date = new Date().toISOString()
        }

        const { error } = await supabase
          .from("invoices")
          .update(updates)
          .eq("id", data.invoiceId)
          .eq("stable_id", stableId)
        if (error) throw error
        return { success: true, message: `Invoice marked as ${data.status}` }
      }

      // ─────────────────────────────────────
      // SERVICES
      // ─────────────────────────────────────
      case "UPDATE_SERVICE_PRICE": {
        const { error } = await supabase
          .from("services")
          .update({ price: data.price })
          .eq("id", data.serviceId)
          .eq("stable_id", stableId)
        if (error) throw error
        return { success: true, message: "Service price updated" }
      }

      case "LIST_SERVICES": {
        const { data: services, error } = await supabase
          .from("services")
          .select("id, name, price, category, currency")
          .eq("stable_id", stableId)
          .eq("is_active", true)
        if (error) throw error
        return { success: true, data: services }
      }

      default:
        return { success: false, message: `Unknown action: ${type}` }
    }
  } catch (error) {
    console.error(`Action ${type} failed:`, error)
    return { success: false, message: `Action failed: ${error}` }
  }
}

// ═══════════════════════════════════════════════════════════════════
// MEMORY HANDLER
// ═══════════════════════════════════════════════════════════════════

async function handleMemory(
  memoryAction: { type: string; memoryType?: string; key: string; value?: string },
  stableId: string
): Promise<void> {
  const supabase = getSupabaseAdmin()

  if (memoryAction.type === "REMEMBER") {
    await supabase.from("ai_memory").upsert(
      {
        stable_id: stableId,
        memory_type: memoryAction.memoryType || "fact",
        key: memoryAction.key,
        value: memoryAction.value || "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stable_id,memory_type,key" }
    )
  } else if (memoryAction.type === "FORGET") {
    await supabase
      .from("ai_memory")
      .delete()
      .eq("stable_id", stableId)
      .eq("key", memoryAction.key)
  }
}

// ═══════════════════════════════════════════════════════════════════
// FORMAT REPLY FOR WHATSAPP
// ═══════════════════════════════════════════════════════════════════

function formatReply(
  message: string,
  suggestions?: string[]
): string {
  let reply = message

  // Add numbered suggestions if provided
  if (suggestions && suggestions.length > 0) {
    reply += "\n\n"
    suggestions.forEach((s, i) => {
      reply += `${i + 1}. ${s}\n`
    })
  }

  // Ensure max length for WhatsApp
  if (reply.length > 4000) {
    reply = reply.substring(0, 3997) + "..."
  }

  return reply
}

// ═══════════════════════════════════════════════════════════════════
// GET — META WEBHOOK VERIFICATION
// ═══════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("WhatsApp webhook verified")
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse("Forbidden", { status: 403 })
}

// ═══════════════════════════════════════════════════════════════════
// POST — HANDLE INCOMING WHATSAPP MESSAGES
// ═══════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Extract message data
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    // Ignore status updates (delivery, read receipts)
    if (value?.statuses) {
      return new NextResponse("OK")
    }

    const messages = value?.messages
    if (!messages?.length) {
      return new NextResponse("OK")
    }

    const message = messages[0]
    const from = message.from
    const messageType = message.type

    // Get sender name from contacts
    const contacts = value?.contacts || []
    const contact = contacts.find((c: { wa_id: string }) => c.wa_id === from)
    const profileName = contact?.profile?.name || "Owner"

    // Extract message content
    let userMessage = ""
    let mediaId: string | null = null
    let mediaType: string | null = null

    if (messageType === "text") {
      userMessage = message.text?.body || ""
    } else if (messageType === "audio") {
      mediaId = message.audio?.id
      mediaType = "audio"
      userMessage = await transcribeAudio(mediaId) || ""
      if (!userMessage) {
        await sendMessage(
          from,
          "Sorry, I couldn't understand that voice note. Please try again or type your message."
        )
        return new NextResponse("OK")
      }
    } else if (messageType === "image") {
      userMessage = message.image?.caption || "[Image received]"
    } else {
      await sendMessage(
        from,
        "I can handle text and voice messages. Please type or record your request."
      )
      return new NextResponse("OK")
    }

    if (!userMessage.trim()) {
      return new NextResponse("OK")
    }

    const supabase = getSupabaseAdmin()

    // Find profile by WhatsApp number
    const phoneClean = from.replace(/\D/g, "")
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, stables(*)")
      .or(
        `whatsapp_number.eq.${from},` +
        `whatsapp_number.eq.+${phoneClean},` +
        `whatsapp_number.ilike.%${phoneClean}`
      )
      .single()

    // Not registered
    if (!profile) {
      await sendMessage(
        from,
        `Hi ${profileName}! I'm your StableMate assistant.\n\n` +
        `Your number isn't connected yet.\n\n` +
        `To connect:\n` +
        `1. Open StableMate web app\n` +
        `2. Go to Settings > WhatsApp\n` +
        `3. Enter your number: +${phoneClean}\n\n` +
        `Then message me again!`
      )
      return new NextResponse("OK")
    }

    const stableId = profile.stable_id
    const stableName = profile.stables?.stable_name || "Your Stable"

    // Save incoming message
    await supabase.from("whatsapp_messages").insert({
      stable_id: stableId,
      phone_number: from,
      profile_name: profileName,
      role: "user",
      content: userMessage,
      media_id: mediaId,
      media_type: mediaType,
      raw_type: messageType,
    })

    // Load conversation history (last 10)
    const { data: recentMsgs } = await supabase
      .from("whatsapp_messages")
      .select("role, content")
      .eq("stable_id", stableId)
      .eq("phone_number", from)
      .order("created_at", { ascending: false })
      .limit(10)

    const history = (recentMsgs || [])
      .reverse()
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))

    // Load stable data in parallel
    const [
      horses, clients, staff, services,
      stalls, tasks, events, invoices,
      documents, memory
    ] = await Promise.all([
      supabase.from("horses").select("id, name, breed, stall_id").eq("stable_id", stableId),
      supabase.from("clients").select("id, full_name, email, phone").eq("stable_id", stableId),
      supabase.from("team_members").select("id, full_name, role, status_detail").eq("stable_id", stableId).eq("is_active", true),
      supabase.from("services").select("id, name, price, category, currency").eq("stable_id", stableId).eq("is_active", true),
      supabase.from("stalls").select("id, label, type").eq("stable_id", stableId),
      supabase.from("staff_tasks").select("id, title, status, due_date, assigned_to").eq("stable_id", stableId).eq("status", "pending"),
      supabase.from("calendar_events").select("id, title, start_time, category").eq("stable_id", stableId).gte("start_time", new Date().toISOString()).order("start_time").limit(15),
      supabase.from("invoices").select("id, invoice_number, status, total").eq("stable_id", stableId).order("created_at", { ascending: false }).limit(10),
      supabase.from("documents").select("id, title, category, expiry_date, ai_summary").eq("stable_id", stableId),
      supabase.from("ai_memory").select("key, value, memory_type").eq("stable_id", stableId).limit(30),
    ])

    const context = {
      stableName,
      today: new Date().toLocaleDateString("en", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      horses: horses.data || [],
      clients: clients.data || [],
      staff: staff.data || [],
      services: services.data || [],
      stalls: stalls.data || [],
      pendingTasks: tasks.data || [],
      upcomingEvents: events.data || [],
      invoices: invoices.data || [],
      documents: documents.data || [],
    }

    const memoryList = memory.data || []

    // Build system prompt
    const systemPrompt = `You are the AI stable manager for ${stableName}, responding via WhatsApp to ${profileName}.

TODAY: ${context.today}

WHATSAPP RULES:
- Keep replies SHORT (max 5 lines)
- Use *bold* for important names/values
- Use emoji sparingly but helpfully
- No markdown headers (#, ##)
- Always confirm what you did
- If user replies "1" "2" "3" they're selecting from suggestions
- Be friendly and concise

STABLE DATA:
Horses: ${context.horses.map((h: { name: string; id: string }) => `${h.name}(id:${h.id})`).join(", ") || "none"}

Clients: ${context.clients.map((c: { full_name: string; id: string }) => `${c.full_name}(id:${c.id})`).join(", ") || "none"}

Staff: ${context.staff.map((s: { full_name: string; id: string; status_detail: string }) => `${s.full_name}(id:${s.id}) ${s.status_detail}`).join(", ") || "none"}

Services: ${context.services.map((s: { name: string; price: number; currency: string }) => `${s.name} ${s.price / 100}${s.currency}`).join(", ") || "none"}

Stalls: ${context.stalls.map((s: { label: string }) => s.label).join(", ") || "none"}

Pending Tasks: ${context.pendingTasks.length}
Upcoming Events: ${context.upcomingEvents.length}

Recent Invoices: ${context.invoices.map((i: { invoice_number: string; status: string }) => `${i.invoice_number}(${i.status})`).join(", ") || "none"}

MEMORY:
${memoryList.map((m: { key: string; value: string }) => `${m.key}: ${m.value}`).join("\n") || "none"}

LANGUAGE: Detect from user message. Respond in same language (EN/IT/DE/ES).

ACTIONS YOU CAN TAKE:
Calendar: ADD_CALENDAR_EVENT, UPDATE_CALENDAR_EVENT, DELETE_CALENDAR_EVENT, LIST_EVENTS
Tasks: ASSIGN_TASK, COMPLETE_TASK, LIST_TASKS
Billing: CREATE_INVOICE, UPDATE_INVOICE_STATUS, GET_CLIENT_BALANCE
Staff: UPDATE_STAFF_STATUS, GET_STAFF_INFO
Clients: GET_CLIENT_INFO, ADD_CLIENT, UPDATE_CLIENT, LIST_CLIENTS
Horses: GET_HORSE_INFO, ADD_HORSE, UPDATE_HORSE
Documents: FIND_DOCUMENT, LIST_DOCUMENTS
Services: UPDATE_SERVICE_PRICE, LIST_SERVICES
Memory: REMEMBER, RECALL, FORGET

COMMAND EXAMPLES:
"add lesson for giulia friday 10am" -> ADD_CALENDAR_EVENT
"aggiungi una lezione per giulia" -> ADD_CALENDAR_EVENT (Italian)
"marco ist krank" -> UPDATE_STAFF_STATUS sick (German)
"quanto deve giulia?" -> GET_CLIENT_BALANCE (Italian)
"assign stall cleaning to anna today" -> ASSIGN_TASK
"find bella's vaccination" -> FIND_DOCUMENT
"remember dr rossi is our vet 333123" -> REMEMBER
"who is working today?" -> GET_STAFF_INFO
"show schedule for tomorrow" -> LIST_EVENTS

Return ONLY this JSON:
{
  "message": "Short WhatsApp reply",
  "language": "en",
  "action": {
    "type": "ACTION_TYPE",
    "data": {}
  },
  "memoryAction": null,
  "suggestions": ["option 1", "option 2"]
}`

    // Call Claude
    const anthropic = getAnthropic()
    const claudeRes = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: systemPrompt,
      messages: [
        ...history,
        { role: "user", content: userMessage },
      ],
    })

    const rawText = claudeRes.content[0].type === "text" ? claudeRes.content[0].text : ""

    // Parse response
    let parsed: {
      message: string
      language?: string
      action?: { type: string; data: Record<string, unknown> }
      memoryAction?: { type: string; memoryType?: string; key: string; value?: string }
      suggestions?: string[]
    }

    try {
      const cleaned = rawText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = { message: rawText, action: undefined }
    }

    // Execute action if any
    if (parsed.action) {
      const result = await executeAction(parsed.action, stableId)
      if (!result.success && result.message) {
        parsed.message += `\n\n(${result.message})`
      }
    }

    // Handle memory action
    if (parsed.memoryAction) {
      await handleMemory(parsed.memoryAction, stableId)
    }

    // Format and send reply
    const reply = formatReply(parsed.message, parsed.suggestions)

    // Save assistant response
    await supabase.from("whatsapp_messages").insert({
      stable_id: stableId,
      phone_number: from,
      profile_name: "StableMate",
      role: "assistant",
      content: reply,
      action_type: parsed.action?.type,
      action_data: parsed.action?.data,
    })

    // Send WhatsApp message
    await sendMessage(from, reply)

    return new NextResponse("OK")
  } catch (error) {
    console.error("WhatsApp webhook error:", error)
    return new NextResponse("Error", { status: 500 })
  }
}
