/**
 * FILE: app/api/analyse-document/route.ts
 * ZONE: Yellow
 * PURPOSE: API endpoint to analyse documents with Claude AI - extracts metadata and pre-fills forms
 * EXPORTS: POST, maxDuration, dynamic
 * DEPENDS ON: Anthropic API
 * CONSUMED BY: DocumentUploadSheet, BulkUploadSheet, DocumentDetailSheet
 * TESTS: app/api/analyse-document/route.test.ts
 * LAST CHANGED: 2026-03-07 — Added smart PDF analysis with entity detection
 */

import { NextRequest, NextResponse } from "next/server"

// BREADCRUMB: Route config for document analysis - allows longer processing time
export const maxDuration = 60
export const dynamic = "force-dynamic"

// BREADCRUMB: Comprehensive system prompt for horse stable document analysis
const SYSTEM_PROMPT = `You are analysing a horse stable management document. Extract all relevant info and classify it correctly.

CATEGORY OPTIONS:
- stable_license: Stable operating licenses and permits
- stable_insurance: Stable liability and property insurance
- stable_contract: Stable rental/lease agreements
- horse_passport: Horse identification documents and passports
- horse_vaccination: Vaccination records and certificates
- horse_insurance: Horse insurance policies
- horse_medical: Veterinary reports, health certificates, medical records
- client_contract: Boarding agreements, client contracts
- client_insurance: Client liability insurance
- client_invoice: Invoices to clients
- staff_contract: Employment contracts
- staff_certification: Staff certifications and qualifications
- financial_report: Financial reports, statements
- compliance_audit: Safety audits, compliance certificates
- other: Documents that don't fit other categories

ENTITY TYPE RULES:
- If document mentions a specific horse name → entityType: "horse"
- If document is about a client/owner → entityType: "client"
- If document is about an employee → entityType: "staff"
- If document is general stable business → entityType: "stable"

Return ONLY this JSON (no markdown):
{
  "title": "Suggested document title",
  "category": "exact_category_from_list",
  "categoryLabel": "Human readable category name",
  "summary": "2-3 sentence summary of document content",
  "documentDate": "2024-01-01 or null if not found",
  "expiryDate": "2025-01-01 or null if not found",
  "issuedBy": "Name of issuing authority/person/company or null",
  "referenceNumber": "Reference/policy/contract number or null",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "entities": {
    "horseName": "Name if mentioned or null",
    "clientName": "Name if mentioned or null",
    "staffName": "Name if mentioned or null",
    "vetName": "Veterinarian name if mentioned or null",
    "companyName": "Company/organization name if mentioned or null"
  },
  "entityType": "horse|client|staff|stable",
  "confidence": "high|medium|low",
  "language": "Detected document language",
  "keyDates": [
    {"label": "Issue Date", "date": "2024-01-01"},
    {"label": "Expiry Date", "date": "2025-01-01"}
  ],
  "importantInfo": [
    "Policy number: ABC123",
    "Coverage amount: EUR 500,000",
    "Key terms or conditions"
  ]
}`

interface AnalyseRequest {
  pdfBase64?: string
  imageBase64?: string
  mediaType?: string
  fileName?: string
  documentUrl?: string
  documentTitle?: string
  category?: string
}

interface AnalysisResult {
  success: boolean
  title?: string
  category?: string
  categoryLabel?: string
  summary?: string
  documentDate?: string | null
  expiryDate?: string | null
  issuedBy?: string | null
  referenceNumber?: string | null
  suggestedTags?: string[]
  entities?: {
    horseName?: string | null
    clientName?: string | null
    staffName?: string | null
    vetName?: string | null
    companyName?: string | null
  }
  entityType?: string
  confidence?: string
  language?: string
  keyDates?: Array<{ label: string; date: string }>
  importantInfo?: string[]
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalysisResult>> {
  try {
    const body: AnalyseRequest = await request.json()
    const { pdfBase64, imageBase64, mediaType, fileName, documentUrl, documentTitle, category } = body

    if (!pdfBase64 && !imageBase64 && !documentUrl) {
      return NextResponse.json(
        { success: false, error: "No document data provided" },
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
    type ContentBlock =
      | { type: "document"; source: { type: "base64"; media_type: string; data: string } }
      | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
      | { type: "text"; text: string }

    const userContent: ContentBlock[] = []

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
    } else if (imageBase64 && mediaType) {
      // Image provided as base64
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: imageBase64,
        },
      })
    }

    // Add context and instruction
    userContent.push({
      type: "text",
      text: `Analyse this document from a horse stable.
${fileName ? `File name: ${fileName}` : ""}
${documentTitle ? `Title hint: ${documentTitle}` : ""}
${category ? `Category hint: ${category}` : ""}
${documentUrl && !pdfBase64 && !imageBase64 ? `Document URL: ${documentUrl}` : ""}

Extract all information and classify it accurately.
Return only the JSON object, no additional text.`,
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
        title: parsed.title,
        category: parsed.category,
        categoryLabel: parsed.categoryLabel,
        summary: parsed.summary,
        documentDate: parsed.documentDate,
        expiryDate: parsed.expiryDate,
        issuedBy: parsed.issuedBy,
        referenceNumber: parsed.referenceNumber,
        suggestedTags: parsed.suggestedTags || [],
        entities: parsed.entities || {},
        entityType: parsed.entityType,
        confidence: parsed.confidence || "medium",
        language: parsed.language,
        keyDates: parsed.keyDates || [],
        importantInfo: parsed.importantInfo || [],
      })
    } catch {
      // If JSON parsing fails, return partial data
      console.error("Failed to parse Claude response:", cleaned.slice(0, 500))
      return NextResponse.json({
        success: true,
        summary: cleaned.slice(0, 500),
        confidence: "low",
        suggestedTags: [],
        keyDates: [],
        importantInfo: [],
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
