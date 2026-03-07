/**
 * FILE: app/api/analyse-document/route.ts
 * ZONE: Yellow
 * PURPOSE: API endpoint to analyse documents with Claude AI
 * EXPORTS: POST, maxDuration, dynamic
 * DEPENDS ON: Anthropic API
 * CONSUMED BY: DocumentDetailSheet component
 * TESTS: app/api/analyse-document/route.test.ts
 * LAST CHANGED: 2026-03-07 — Initial creation
 */

import { NextRequest, NextResponse } from "next/server"

// BREADCRUMB: Route config for document analysis - allows longer processing time
export const maxDuration = 60
export const dynamic = "force-dynamic"

// BREADCRUMB: System prompt for document analysis
const SYSTEM_PROMPT = `You are an expert document analyst for horse stable management. Analyze the provided document and extract key information.

Your task is to:
1. Summarize the document in 2-3 sentences
2. Extract any important dates (issue date, expiry date, renewal dates)
3. Identify key entities mentioned (horses, people, companies, locations)
4. Suggest relevant tags for categorization
5. Note any action items or deadlines

Return ONLY valid JSON, no markdown:
{
  "summary": "Brief 2-3 sentence summary of the document",
  "keyDates": [
    { "type": "expiry", "date": "2024-12-31", "description": "Policy expiration" }
  ],
  "entities": [
    { "type": "horse", "name": "Thunder" },
    { "type": "company", "name": "Allianz Insurance" }
  ],
  "suggestedTags": ["insurance", "annual", "liability"],
  "actionItems": [
    { "action": "Renew policy", "deadline": "2024-11-30" }
  ],
  "confidence": "high"
}`

interface AnalyseRequest {
  documentUrl?: string
  documentTitle?: string
  category?: string
  pdfBase64?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyseRequest = await request.json()
    const { documentUrl, documentTitle, category, pdfBase64 } = body

    if (!documentUrl && !pdfBase64) {
      return NextResponse.json(
        { success: false, error: "No document URL or PDF data provided" },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error("No ANTHROPIC_API_KEY configured")
      return NextResponse.json(
        { success: false, error: "API key not configured" },
        { status: 500 }
      )
    }

    // BREADCRUMB: Build the message content based on input type
    const userContent: Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }> = []

    if (pdfBase64) {
      // PDF document provided as base64
      userContent.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: pdfBase64,
        },
      })
    }

    // Add context and instruction
    userContent.push({
      type: "text",
      text: `Analyze this document${documentTitle ? ` titled "${documentTitle}"` : ""}${category ? ` (category: ${category})` : ""}${documentUrl && !pdfBase64 ? `. Document URL: ${documentUrl}` : ""}.

Extract key information and return the JSON analysis. Focus on dates, entities, and actionable items relevant to horse stable management.`,
    })

    // BREADCRUMB: Determine which headers to use based on content type
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    }

    // Add PDF beta header if we have PDF content
    if (pdfBase64) {
      headers["anthropic-beta"] = "pdfs-2024-09-25"
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: "Unknown API error" }))
      console.error("Anthropic API error:", JSON.stringify(errData, null, 2))
      return NextResponse.json(
        { success: false, error: errData.error?.message || "AI analysis failed" },
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
      return NextResponse.json({
        success: true,
        summary: parsed.summary,
        keyDates: parsed.keyDates || [],
        entities: parsed.entities || [],
        suggestedTags: parsed.suggestedTags || [],
        actionItems: parsed.actionItems || [],
        confidence: parsed.confidence || "medium",
      })
    } catch {
      // If JSON parsing fails, return the raw summary
      console.error("Failed to parse Claude response:", cleaned.slice(0, 500))
      return NextResponse.json({
        success: true,
        summary: cleaned.slice(0, 500),
        keyDates: [],
        entities: [],
        suggestedTags: [],
        actionItems: [],
        confidence: "low",
      })
    }
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error("Document analysis error:", err.message)
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    )
  }
}
