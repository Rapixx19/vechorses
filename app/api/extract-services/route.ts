/**
 * FILE: app/api/extract-services/route.ts
 * ZONE: Yellow
 * PURPOSE: API endpoint to call Claude for extracting services from PDF text
 * EXPORTS: POST
 * DEPENDS ON: Anthropic API
 * CONSUMED BY: PdfImporter component
 * TESTS: app/api/extract-services/route.test.ts
 * LAST CHANGED: 2026-03-07 — Initial creation for multi-language PDF extraction
 */

import { NextRequest, NextResponse } from "next/server"

// BREADCRUMB: Calls Claude API to extract structured service data from PDF text
export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userPrompt } = await request.json()

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json({ error: "Missing prompts" }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Claude API error:", error)
      return NextResponse.json({ error: "Failed to analyze document" }, { status: 500 })
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || ""

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Extract services error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
