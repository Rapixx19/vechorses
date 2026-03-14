/**
 * FILE: app/api/send-invoice/route.ts
 * ZONE: 🔴 Red
 * PURPOSE: Send invoice emails via Resend API
 * EXPORTS: POST
 * DEPENDS ON: @supabase/supabase-js, resend
 * CONSUMED BY: modules/billing (SendInvoiceModal)
 * TESTS: app/api/send-invoice/route.test.ts
 * LAST CHANGED: 2026-03-14 — Initial creation with Resend integration
 */

// 🔴 RED ZONE — billing email sending, handle with care

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface SendInvoiceRequest {
  invoiceId: string
  recipientEmail?: string
  stableId: string
  testMode?: boolean
  sendCopyToSelf?: boolean
  selfEmail?: string
  markAsSent?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: SendInvoiceRequest = await request.json()
    const {
      invoiceId,
      recipientEmail,
      stableId,
      testMode = false,
      sendCopyToSelf = false,
      selfEmail,
      markAsSent = true,
    } = body

    if (!invoiceId || !stableId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use mock data for test mode
    if (testMode) {
      const mockInvoice: InvoiceData = {
        id: "test-invoice",
        invoice_number: "INV-2024-001",
        issue_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subtotal: 45000,
        tax: 8550,
        tax_rate: 19,
        total: 53550,
        status: "draft",
        clients: {
          full_name: "Test Client",
          email: "ferdinand.straehuber@gmail.com",
        },
        billing_line_items: [
          { description: "Monthly Boarding - Box Stall", amount_cents: 35000, service_date: new Date().toISOString() },
          { description: "Grooming Service", amount_cents: 5000, service_date: new Date().toISOString() },
          { description: "Training Session", amount_cents: 5000, service_date: new Date().toISOString() },
        ],
      }

      const mockStable: StableData = {
        stable_name: "VecHorses Demo Stable",
        address: "123 Horse Lane",
        city: "Vienna",
        country: "Austria",
        email: "demo@vechorses.com",
        phone: "+43 1 234 5678",
        vat_number: "ATU12345678",
        bank_name: "Demo Bank",
        bank_iban: "AT12 3456 7890 1234 5678",
        bank_bic: "DEMOAT12",
        invoice_accent_color: "#2C5F2E",
        invoice_footer_note: "Thank you for choosing VecHorses!",
        currency: "EUR",
      }

      const toEmail = "ferdinand.straehuber@gmail.com"
      const emailHtml = buildInvoiceEmail(mockInvoice, mockStable)
      const resendApiKey = process.env.RESEND_API_KEY

      if (!resendApiKey || resendApiKey === "test") {
        return NextResponse.json({
          success: true,
          testMode: true,
          sentTo: toEmail,
          message: "Email logged to console (RESEND_API_KEY not configured)",
        })
      }

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: [toEmail],
          subject: `[TEST] Invoice ${mockInvoice.invoice_number} from ${mockStable.stable_name}`,
          html: emailHtml,
          reply_to: mockStable.email,
        }),
      })

      if (!resendResponse.ok) {
        const err = await resendResponse.json().catch(() => ({}))
        console.error("Resend API error:", err)
        return NextResponse.json({ error: "Failed to send test email", details: err }, { status: 500 })
      }

      return NextResponse.json({ success: true, testMode: true, sentTo: toEmail })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Fetch invoice with client details
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .select(`
        *,
        clients(full_name, email, phone),
        billing_line_items(*)
      `)
      .eq("id", invoiceId)
      .single()

    if (invoiceError || !invoice) {
      console.error("Invoice fetch error:", invoiceError)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Fetch stable settings
    const { data: stable, error: stableError } = await supabaseAdmin
      .from("stables")
      .select("*")
      .eq("id", stableId)
      .single()

    if (stableError || !stable) {
      console.error("Stable fetch error:", stableError)
      return NextResponse.json({ error: "Stable not found" }, { status: 404 })
    }

    // Determine recipient email
    const toEmail = testMode
      ? "ferdinand.straehuber@gmail.com"
      : recipientEmail || invoice.clients?.email

    if (!toEmail) {
      return NextResponse.json({ error: "No recipient email provided" }, { status: 400 })
    }

    // Build email HTML
    const emailHtml = buildInvoiceEmail(invoice, stable)

    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey || resendApiKey === "test") {
      // Test mode: log email instead of sending
      console.log("=== TEST MODE: Invoice Email ===")
      console.log("To:", toEmail)
      console.log("Subject:", `Invoice ${invoice.invoice_number} from ${stable.stable_name}`)
      console.log("HTML Length:", emailHtml.length)
      console.log("================================")

      return NextResponse.json({
        success: true,
        testMode: true,
        sentTo: toEmail,
        message: "Email logged to console (RESEND_API_KEY not configured)",
      })
    }

    // Send via Resend API
    const recipients = [toEmail]
    if (sendCopyToSelf && selfEmail) {
      recipients.push(selfEmail)
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: recipients,
        subject: `Invoice ${invoice.invoice_number} from ${stable.stable_name}`,
        html: emailHtml,
        reply_to: stable.email || "ferdinand.straehuber@gmail.com",
      }),
    })

    if (!resendResponse.ok) {
      const err = await resendResponse.json().catch(() => ({}))
      console.error("Resend API error:", err)
      return NextResponse.json(
        { error: "Failed to send email", details: err },
        { status: 500 }
      )
    }

    // Update invoice status to 'sent' if requested and currently draft
    if (markAsSent && invoice.status === "draft") {
      await supabaseAdmin
        .from("invoices")
        .update({ status: "sent" })
        .eq("id", invoiceId)
    }

    return NextResponse.json({
      success: true,
      sentTo: toEmail,
      copySentTo: sendCopyToSelf ? selfEmail : undefined,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Send invoice API error:", errorMessage, error)
    return NextResponse.json(
      { error: "Failed to send invoice", details: errorMessage },
      { status: 500 }
    )
  }
}

interface InvoiceData {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string
  subtotal: number
  tax?: number
  tax_rate?: number
  total: number
  status: string
  notes?: string
  recipient_name?: string
  clients?: {
    full_name: string
    email?: string
    phone?: string
  }
  billing_line_items?: Array<{
    description: string
    amount_cents: number
    service_date: string
  }>
}

interface StableData {
  stable_name: string
  address?: string
  city?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  logo_data?: string
  vat_number?: string
  bank_name?: string
  bank_iban?: string
  bank_bic?: string
  invoice_accent_color?: string
  invoice_footer_note?: string
  payment_terms_days?: number
  currency?: string
}

function buildInvoiceEmail(invoice: InvoiceData, stable: StableData): string {
  const accentColor = stable.invoice_accent_color || "#2C5F2E"
  const currency = stable.currency || "EUR"

  const lineItemsHtml =
    invoice.billing_line_items
      ?.map(
        (item, i) => `
      <tr style="border-bottom: 1px solid #eee">
        <td style="padding: 12px 8px; color: #555">${i + 1}</td>
        <td style="padding: 12px 8px; color: #333">${item.description}</td>
        <td style="padding: 12px 8px; color: #555">
          ${new Date(item.service_date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })}
        </td>
        <td style="padding: 12px 8px; text-align: right; color: #333">
          ${currency} ${(item.amount_cents / 100).toFixed(2)}
        </td>
      </tr>
    `
      )
      .join("") || ""

  const subtotal =
    invoice.billing_line_items?.reduce((s, i) => s + i.amount_cents, 0) || invoice.subtotal || 0

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number}</title>
</head>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td>
        <table width="600" cellpadding="0" cellspacing="0" style="margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: ${accentColor}; padding: 32px 40px; color: #fff;">
              <table width="100%">
                <tr>
                  <td>
                    ${
                      stable.logo_data
                        ? `<img src="${stable.logo_data}" style="max-height: 60px; max-width: 150px; object-fit: contain;" alt="${stable.stable_name}" />`
                        : `<div style="font-size: 24px; font-weight: bold;">${stable.stable_name}</div>`
                    }
                  </td>
                  <td style="text-align: right;">
                    <div style="font-size: 28px; font-weight: bold; letter-spacing: 2px;">INVOICE</div>
                    <div style="opacity: 0.85; margin-top: 4px;">${invoice.invoice_number}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- From / Bill To -->
          <tr>
            <td style="padding: 32px 40px;">
              <table width="100%">
                <tr>
                  <td style="width: 50%; vertical-align: top;">
                    <div style="font-size: 11px; color: #999; text-transform: uppercase; margin-bottom: 8px;">From</div>
                    <div style="font-weight: bold; font-size: 15px; color: #333;">${stable.stable_name}</div>
                    ${stable.address ? `<div style="color: #555; margin-top: 4px;">${stable.address}</div>` : ""}
                    ${stable.city || stable.country ? `<div style="color: #555;">${[stable.city, stable.country].filter(Boolean).join(", ")}</div>` : ""}
                    ${stable.email ? `<div style="color: #555; margin-top: 8px;">${stable.email}</div>` : ""}
                    ${stable.vat_number ? `<div style="color: #555;">VAT: ${stable.vat_number}</div>` : ""}
                  </td>
                  <td style="width: 50%; vertical-align: top; text-align: right;">
                    <div style="font-size: 11px; color: #999; text-transform: uppercase; margin-bottom: 8px;">Bill To</div>
                    <div style="font-weight: bold; font-size: 15px; color: #333;">
                      ${invoice.clients?.full_name || invoice.recipient_name || "—"}
                    </div>
                    ${invoice.clients?.email ? `<div style="color: #555; margin-top: 4px;">${invoice.clients.email}</div>` : ""}
                    <div style="margin-top: 16px; color: #555; font-size: 13px;">
                      Issue Date: ${new Date(invoice.issue_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      <br/>
                      Due Date: ${new Date(invoice.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Line Items Table -->
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background: ${accentColor}15;">
                    <th style="padding: 12px 8px; text-align: left; font-size: 12px; color: #555; width: 40px;">#</th>
                    <th style="padding: 12px 8px; text-align: left; font-size: 12px; color: #555;">Description</th>
                    <th style="padding: 12px 8px; text-align: left; font-size: 12px; color: #555;">Date</th>
                    <th style="padding: 12px 8px; text-align: right; font-size: 12px; color: #555;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${lineItemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 24px 40px;">
              <table style="margin-left: auto;">
                <tr>
                  <td style="padding: 6px 16px 6px 0; color: #555; text-align: right;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right; min-width: 100px;">
                    ${currency} ${(subtotal / 100).toFixed(2)}
                  </td>
                </tr>
                ${
                  invoice.tax
                    ? `<tr>
                    <td style="padding: 6px 16px 6px 0; color: #555; text-align: right;">Tax (${invoice.tax_rate || 0}%)</td>
                    <td style="padding: 6px 0; text-align: right;">
                      ${currency} ${((invoice.tax || 0) / 100).toFixed(2)}
                    </td>
                  </tr>`
                    : ""
                }
                <tr style="border-top: 2px solid ${accentColor};">
                  <td style="padding: 12px 16px 12px 0; font-weight: bold; font-size: 16px; text-align: right; color: ${accentColor};">
                    TOTAL
                  </td>
                  <td style="padding: 12px 0; font-weight: bold; font-size: 16px; text-align: right; color: ${accentColor};">
                    ${currency} ${((invoice.total || 0) / 100).toFixed(2)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Details -->
          ${
            stable.bank_iban
              ? `
          <tr>
            <td style="padding: 0 40px 24px;">
              <div style="background: #f8f8f8; border-radius: 8px; padding: 16px;">
                <div style="font-weight: bold; font-size: 13px; margin-bottom: 8px; color: #333;">Payment Details</div>
                ${stable.bank_name ? `<div style="color: #555; font-size: 13px;">Bank: ${stable.bank_name}</div>` : ""}
                <div style="color: #555; font-size: 13px;">IBAN: ${stable.bank_iban}</div>
                ${stable.bank_bic ? `<div style="color: #555; font-size: 13px;">BIC: ${stable.bank_bic}</div>` : ""}
                <div style="color: #555; font-size: 13px;">Reference: ${invoice.invoice_number}</div>
              </div>
            </td>
          </tr>`
              : ""
          }

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background: #f8f8f8; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee;">
              ${stable.invoice_footer_note || "Thank you for your business!"}
              <br/><br/>
              ${stable.stable_name} · Powered by VecHorses
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
