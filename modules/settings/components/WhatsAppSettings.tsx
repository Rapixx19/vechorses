/**
 * FILE: modules/settings/components/WhatsAppSettings.tsx
 * ZONE: Yellow
 * PURPOSE: WhatsApp integration settings for connecting owner's phone number
 * EXPORTS: WhatsAppSettings
 * DEPENDS ON: @supabase/supabase-js, lib/hooks/useAuth
 * CONSUMED BY: app/settings/page.tsx
 * TESTS: modules/settings/tests/WhatsAppSettings.test.tsx
 * LAST CHANGED: 2026-03-08 — Initial WhatsApp settings implementation
 */

"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Check, Phone, Shield, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"

interface WhatsAppSettingsProps {
  className?: string
}

export function WhatsAppSettings({ className }: WhatsAppSettingsProps) {
  const { currentUser } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Load current WhatsApp settings
  useEffect(() => {
    async function loadSettings() {
      if (!currentUser?.id) return

      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("whatsapp_number, whatsapp_verified")
        .eq("id", currentUser.id)
        .single()

      if (data) {
        setPhoneNumber(data.whatsapp_number || "")
        setIsVerified(data.whatsapp_verified || false)
      }
    }

    loadSettings()
  }, [currentUser?.id])

  const handleSave = async () => {
    if (!currentUser?.id) return

    setIsSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      // Format phone number
      let formattedNumber = phoneNumber.replace(/\s+/g, "").replace(/-/g, "")
      if (!formattedNumber.startsWith("+")) {
        formattedNumber = "+" + formattedNumber
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          whatsapp_number: formattedNumber,
          whatsapp_verified: false, // Reset verification on number change
        })
        .eq("id", currentUser.id)

      if (error) throw error

      setPhoneNumber(formattedNumber)
      setIsVerified(false)
      setMessage({
        type: "success",
        text: "Phone number saved! Send a message to our WhatsApp to verify.",
      })
    } catch (error) {
      console.error("Failed to save WhatsApp settings:", error)
      setMessage({
        type: "error",
        text: "Failed to save. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleVerify = async () => {
    // In production, this would trigger a verification code flow
    // For now, we just mark as verified when user confirms they sent a message
    if (!currentUser?.id) return

    setIsSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update({ whatsapp_verified: true })
        .eq("id", currentUser.id)

      if (error) throw error

      setIsVerified(true)
      setMessage({
        type: "success",
        text: "WhatsApp connected! You can now manage your stable via chat.",
      })
    } catch (error) {
      console.error("Verification failed:", error)
      setMessage({
        type: "error",
        text: "Verification failed. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-green-500/10">
          <MessageCircle className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            WhatsApp Integration
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            Control your stable via WhatsApp messages
          </p>
        </div>
      </div>

      {/* Status indicator */}
      <div className={`mb-6 p-4 rounded-lg ${isVerified ? "bg-green-500/10 border border-green-500/30" : "bg-yellow-500/10 border border-yellow-500/30"}`}>
        <div className="flex items-center gap-2">
          {isVerified ? (
            <>
              <Check className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-500">Connected</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium text-yellow-500">Not Connected</span>
            </>
          )}
        </div>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {isVerified
            ? `Your WhatsApp (${phoneNumber}) is connected to StableMate.`
            : "Connect your WhatsApp to manage your stable via chat."}
        </p>
      </div>

      {/* Phone number input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            <Phone className="inline h-4 w-4 mr-1" />
            Your WhatsApp Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+39 333 123 4567"
            className="w-full px-4 py-3 rounded-lg bg-[#252538] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#2C5F2E]"
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Include country code (e.g., +39 for Italy, +49 for Germany)
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !phoneNumber.trim()}
          className="w-full px-4 py-3 rounded-lg bg-[#2C5F2E] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a7a3d] transition-colors"
        >
          {isSaving ? "Saving..." : "Save Phone Number"}
        </button>
      </div>

      {/* Verification instructions */}
      {phoneNumber && !isVerified && (
        <div className="mt-6 p-4 rounded-lg bg-[#252538] border border-[var(--border)]">
          <h4 className="font-medium text-[var(--text-primary)] mb-3">
            How to Connect
          </h4>
          <ol className="space-y-3 text-sm text-[var(--text-muted)]">
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2C5F2E] text-white text-xs flex items-center justify-center">
                1
              </span>
              <span>Save our WhatsApp number: <strong className="text-[var(--text-primary)]">+1 555 STABLE</strong></span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2C5F2E] text-white text-xs flex items-center justify-center">
                2
              </span>
              <span>Send any message to start (e.g., "Hello")</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2C5F2E] text-white text-xs flex items-center justify-center">
                3
              </span>
              <span>Click "Verify Connection" below once you've sent a message</span>
            </li>
          </ol>

          <button
            onClick={handleVerify}
            disabled={isSaving}
            className="mt-4 w-full px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
          >
            <Check className="inline h-4 w-4 mr-2" />
            Verify Connection
          </button>
        </div>
      )}

      {/* Success/Error message */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {message.text}
        </div>
      )}

      {/* Features list */}
      <div className="mt-6 p-4 rounded-lg bg-[#252538]">
        <h4 className="font-medium text-[var(--text-primary)] mb-3">
          What You Can Do via WhatsApp
        </h4>
        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Schedule lessons and vet visits
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Assign tasks to staff members
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Check client balances and create invoices
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Update staff status (sick, vacation)
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Find documents and check expiry dates
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Send voice notes in any language
          </li>
        </ul>
      </div>

      {/* Privacy note */}
      <div className="mt-4 flex items-start gap-2 text-xs text-[var(--text-muted)]">
        <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          Your WhatsApp number is stored securely and only used for stable management.
          Messages are processed by AI to execute actions. We never share your data with third parties.
        </p>
      </div>
    </div>
  )
}
