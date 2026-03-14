/**
 * FILE: app/api/assistant/transcribe/route.ts
 * ZONE: Yellow
 * PURPOSE: Transcribe audio to text using OpenAI Whisper API
 * EXPORTS: POST
 * DEPENDS ON: openai
 * CONSUMED BY: modules/assistant (voice input)
 * TESTS: None
 * LAST CHANGED: 2026-03-14 — Initial creation
 */

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File | null

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      // Fallback: return empty transcription with info message
      return NextResponse.json({
        text: "",
        error: "Speech-to-text not configured. Please add OPENAI_API_KEY to environment variables.",
      })
    }

    // Create form data for OpenAI API
    const openaiFormData = new FormData()
    openaiFormData.append("file", audioFile, "audio.webm")
    openaiFormData.append("model", "whisper-1")
    openaiFormData.append("language", "en") // Can be extended to auto-detect

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
      },
      body: openaiFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenAI transcription error:", errorData)
      return NextResponse.json(
        { error: "Failed to transcribe audio", details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      text: data.text || "",
      duration: data.duration,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Transcription API error:", errorMessage)
    return NextResponse.json({ error: "Failed to process transcription", details: errorMessage }, { status: 500 })
  }
}
