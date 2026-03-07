/**
 * FILE: app/api/generate-invoices/route.ts
 * ZONE: Yellow
 * PURPOSE: API endpoint to generate draft invoices for all active clients
 * EXPORTS: POST handler
 * DEPENDS ON: lib/supabase.ts
 * CONSUMED BY: BillingSettingsForm auto-invoice feature
 * TESTS: app/api/generate-invoices/route.test.ts
 * LAST CHANGED: 2026-03-07 — Initial creation for auto-invoice feature
 */

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const supabase = createClient()

    // Get current user's stable
    const cookieStore = await cookies()
    const stableId = cookieStore.get("stable_id")?.value

    if (!stableId) {
      return NextResponse.json({ success: false, error: "No stable ID found" }, { status: 401 })
    }

    // Fetch stable settings
    const { data: stable, error: stableError } = await supabase
      .from("stables")
      .select("*, auto_invoice_services")
      .eq("id", stableId)
      .single()

    if (stableError || !stable) {
      return NextResponse.json({ success: false, error: "Stable not found" }, { status: 404 })
    }

    // Fetch active clients for this stable
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, full_name, email")
      .eq("stable_id", stableId)
      .eq("is_active", true)

    if (clientsError) {
      return NextResponse.json({ success: false, error: "Failed to fetch clients" }, { status: 500 })
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No active clients found" })
    }

    // Fetch services to include
    const serviceIds = stable.auto_invoice_services || []
    let services: { id: string; name: string; price: number; currency: string }[] = []

    if (serviceIds.length > 0) {
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name, price, currency")
        .in("id", serviceIds)

      services = servicesData || []
    }

    // Get current invoice number
    const invoicePrefix = stable.invoice_prefix || "INV"
    let invoiceNumber = stable.invoice_start_number || 1001

    // Create draft invoices for each client
    const today = new Date().toISOString().split("T")[0]
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)
    const dueDateStr = dueDate.toISOString().split("T")[0]

    const invoicesToCreate = clients.map((client) => {
      const lineItems = services.map((service) => ({
        description: service.name,
        amount_cents: Math.round(service.price * 100),
        currency: service.currency || stable.currency || "EUR",
      }))

      const subtotal = lineItems.reduce((sum, item) => sum + item.amount_cents, 0)

      const invoice = {
        stable_id: stableId,
        client_id: client.id,
        invoice_number: `${invoicePrefix}-${invoiceNumber}`,
        line_items: lineItems,
        subtotal,
        total: subtotal,
        status: "draft",
        issued_date: today,
        due_date: dueDateStr,
        recipient_type: "client",
        recipient_info: {
          fullName: client.full_name,
          email: client.email,
        },
      }

      invoiceNumber++
      return invoice
    })

    // Insert invoices
    const { error: insertError } = await supabase.from("invoices").insert(invoicesToCreate)

    if (insertError) {
      console.error("Failed to create invoices:", insertError)
      return NextResponse.json({ success: false, error: "Failed to create invoices" }, { status: 500 })
    }

    // Update invoice start number
    await supabase
      .from("stables")
      .update({ invoice_start_number: invoiceNumber })
      .eq("id", stableId)

    return NextResponse.json({
      success: true,
      count: invoicesToCreate.length,
      message: `Created ${invoicesToCreate.length} draft invoice(s)`,
    })
  } catch (error) {
    console.error("Generate invoices error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
