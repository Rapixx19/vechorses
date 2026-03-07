/**
 * FILE: app/api/extract-services/route.ts
 * ZONE: Yellow
 * PURPOSE: API endpoint to call Claude for extracting services from PDF documents
 * EXPORTS: POST
 * DEPENDS ON: @anthropic-ai/sdk
 * CONSUMED BY: PdfImporter component
 * TESTS: app/api/extract-services/route.test.ts
 * LAST CHANGED: 2026-03-07 — Updated to use Anthropic SDK with PDF document support
 */

import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

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
  try {
    const { pdfBase64 } = await request.json()

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF data provided" }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY not configured")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
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
    })

    // Extract text from response
    const responseText = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")

    // Clean response - remove markdown if present
    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    try {
      const parsed = JSON.parse(cleaned)
      return NextResponse.json(parsed)
    } catch {
      // Return raw response for debugging if parse fails
      return NextResponse.json({ error: "Failed to parse response", rawResponse: cleaned }, { status: 500 })
    }
  } catch (error) {
    console.error("Extract services error:", error)
    const message = error instanceof Error ? error.message : "Failed to extract services"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
