/**
 * FILE: app/api/extract-services/route.ts
 * ZONE: Yellow
 * PURPOSE: API endpoint to call Claude for extracting services from PDF documents
 * EXPORTS: POST, maxDuration, dynamic
 * DEPENDS ON: Anthropic API
 * CONSUMED BY: PdfImporter component
 * TESTS: app/api/extract-services/route.test.ts
 * LAST CHANGED: 2026-03-07 — Fixed body size limit for large PDFs
 */

import { NextRequest, NextResponse } from "next/server"

// BREADCRUMB: Route config for large PDF uploads - required for Vercel
export const maxDuration = 60
export const dynamic = "force-dynamic"

// BREADCRUMB: System prompt for extracting services from horse stable price lists
const SYSTEM_PROMPT = `You are an expert at extracting service price lists from horse stable documents in any language (Italian, German, French, Spanish, English).

EXTRACTION RULES:
1. Extract EVERY service line item
2. Swiss format: 1'365.00 → 136500 cents
3. European format: 1.365,00 → 136500 cents
4. Standard format: 1365.00 → 136500 cents
5. All prices as INTEGER CENTS
6. "da definire" or TBD → price = 0
7. Detect currency: CHF, EUR, USD etc.
8. Extract duration/unit: al mese, a volta, per anno, al giorno, 50 min
9. Multi-price services: create separate entry for each price
10. Translate names to English, keep original

CATEGORY MAPPING:
Pensione/Boarding → boarding
Lezione/Lesson → lessons
Lavoro/Training → training
Maniscalco/Farrier → farrier
Veterinario/Vet → vet
Tosatura/Grooming → grooming
Trasporti/Transport → other
Concorsi/Competition → competitions
Pascoli/Pasture → boarding
Feed/Fieno → feed
Giostra/Horse walker → training
Arena → training

Return ONLY valid JSON, no markdown:
{
  "services": [
    {
      "name": "Horse Boarding",
      "originalName": "Pensione cavallo",
      "description": "Monthly horse boarding",
      "category": "boarding",
      "price": 136500,
      "currency": "CHF",
      "unit": "per_month",
      "unitLabel": "month",
      "vatRate": 8.1
    }
  ],
  "detectedLanguage": "Italian",
  "currency": "CHF",
  "confidence": "high"
}`

export async function POST(request: NextRequest) {
  // Log environment check
  console.log("API KEY EXISTS:", !!process.env.ANTHROPIC_API_KEY)
  console.log("API KEY PREFIX:", process.env.ANTHROPIC_API_KEY?.substring(0, 10))
  console.log("FALLBACK KEY EXISTS:", !!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY)

  try {
    // BREADCRUMB: Parse body manually to handle large PDFs and provide better error messages
    const body = await request.text()
    console.log("Request body size:", body.length)

    let parsed: { pdfBase64?: string }
    try {
      parsed = JSON.parse(body)
    } catch (e) {
      console.error("Body parse error:", e)
      return NextResponse.json(
        { error: "Failed to parse request body" },
        { status: 400 }
      )
    }

    const { pdfBase64 } = parsed
    console.log("PDF base64 length:", pdfBase64?.length || 0)

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF data provided" }, { status: 400 })
    }

    // Check PDF size (base64 is ~33% larger than binary)
    const sizeInMB = (pdfBase64.length * 3 / 4) / (1024 * 1024)
    console.log("PDF size MB:", sizeInMB.toFixed(2))

    if (sizeInMB > 32) {
      return NextResponse.json({ error: "PDF too large. Max 32MB." }, { status: 400 })
    }

    // Try both API key sources
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error("No ANTHROPIC_API_KEY configured")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Use direct fetch with beta header for PDF support
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                type: "text",
                text: "Extract all services from this price list. Return only the JSON object, no other text.",
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: "Unknown API error" }))
      console.error("Anthropic API error status:", response.status)
      console.error("Anthropic API error:", JSON.stringify(errData, null, 2))
      return NextResponse.json(
        { error: errData.error?.message || JSON.stringify(errData), apiStatus: response.status },
        { status: 500 }
      )
    }

    const data = await response.json()
    const responseText = data.content?.[0]?.text || ""

    // Clean response - remove markdown if present
    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    try {
      const parsed = JSON.parse(cleaned)
      return NextResponse.json(parsed)
    } catch {
      console.error("Failed to parse Claude response:", cleaned.slice(0, 500))
      return NextResponse.json({ error: "Failed to parse response", rawResponse: cleaned }, { status: 500 })
    }
  } catch (error: unknown) {
    const err = error as { constructor?: { name?: string }; message?: string; status?: number }
    console.error("EXTRACT ERROR TYPE:", err.constructor?.name)
    console.error("EXTRACT ERROR MESSAGE:", err.message)
    console.error("EXTRACT ERROR STATUS:", err.status)
    console.error("EXTRACT ERROR FULL:", JSON.stringify(error, null, 2))

    return NextResponse.json(
      {
        error: err.message || "Unknown error",
        type: err.constructor?.name,
        status: err.status,
      },
      { status: 500 }
    )
  }
}
