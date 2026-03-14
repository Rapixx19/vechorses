/**
 * FILE: modules/billing/components/SendInvoiceModal.tsx
 * ZONE: 🔴 Red
 * PURPOSE: Modal for sending invoices via email
 * EXPORTS: SendInvoiceModal
 * DEPENDS ON: react, lucide-react, lib/types.ts
 * CONSUMED BY: BillingPage, InvoiceBuilder, InvoiceHistoryTable
 * TESTS: modules/billing/tests/SendInvoiceModal.test.tsx
 * LAST CHANGED: 2026-03-14 — Initial creation
 */

// 🔴 RED ZONE — billing email sending, handle with care

"use client"

import { useState } from "react"
import { X, Mail, Loader2, Check, AlertCircle, Send } from "lucide-react"
import type { Invoice, Client } from "@/lib/types"
import { useAuth } from "@/lib/hooks/useAuth"

interface SendInvoiceModalProps {
  invoice: Invoice
  client?: Client | null
  onClose: () => void
  onSuccess?: () => void
}

export function SendInvoiceModal({ invoice, client, onClose, onSuccess }: SendInvoiceModalProps) {
  const { currentUser } = useAuth()
  const [recipientEmail, setRecipientEmail] = useState(
    client?.email || invoice.recipientInfo?.email || ""
  )
  const [sendCopyToSelf, setSendCopyToSelf] = useState(false)
  const [markAsSent, setMarkAsSent] = useState(invoice.status === "draft")
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const selfEmail = currentUser?.email || "ferdinand.straehuber@gmail.com"

  const handleSend = async (testMode: boolean = false) => {
    if (!recipientEmail && !testMode) {
      setSendResult({ success: false, message: "Please enter a recipient email" })
      return
    }

    setIsSending(true)
    setSendResult(null)

    try {
      const response = await fetch("/api/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          recipientEmail: testMode ? undefined : recipientEmail,
          stableId: currentUser?.stableId,
          testMode,
          sendCopyToSelf,
          selfEmail,
          markAsSent: markAsSent && !testMode,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSendResult({
          success: true,
          message: testMode
            ? `Test email sent to ${data.sentTo}`
            : `Invoice sent to ${data.sentTo}${data.copySentTo ? ` and ${data.copySentTo}` : ""}`,
        })
        if (!testMode) {
          setTimeout(() => {
            onSuccess?.()
            onClose()
          }, 2000)
        }
      } else {
        setSendResult({
          success: false,
          message: data.error || "Failed to send email",
        })
      }
    } catch (error) {
      setSendResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send email",
      })
    } finally {
      setIsSending(false)
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md bg-[#252538] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-md bg-[#1A1A2E] rounded-xl border border-[var(--border)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#2C5F2E]/20">
              <Mail className="h-5 w-5 text-[#2C5F2E]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Send Invoice</h3>
              <p className="text-xs text-[var(--text-muted)]">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#252538] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Recipient Email */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Recipient Email
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className={inputClass}
              placeholder="client@example.com"
            />
            {client?.email && recipientEmail !== client.email && (
              <button
                type="button"
                onClick={() => setRecipientEmail(client.email)}
                className="text-xs text-[#2C5F2E] hover:text-green-400 mt-1"
              >
                Use client email: {client.email}
              </button>
            )}
          </div>

          {/* Send copy to self */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sendCopyToSelf}
              onChange={(e) => setSendCopyToSelf(e.target.checked)}
              className="w-4 h-4 rounded border-[#2a2a3e] bg-gray-800 text-green-500 accent-[#2C5F2E]"
            />
            <span className="text-sm text-[var(--text-primary)]">
              Also send copy to me
              <span className="text-[var(--text-muted)] ml-1">({selfEmail})</span>
            </span>
          </label>

          {/* Mark as sent */}
          {invoice.status === "draft" && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={markAsSent}
                onChange={(e) => setMarkAsSent(e.target.checked)}
                className="w-4 h-4 rounded border-[#2a2a3e] bg-gray-800 text-green-500 accent-[#2C5F2E]"
              />
              <span className="text-sm text-[var(--text-primary)]">
                Mark as &quot;Sent&quot; after sending
              </span>
            </label>
          )}

          {/* Result Message */}
          {sendResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                sendResult.success
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              {sendResult.success ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400" />
              )}
              <p
                className={`text-sm ${sendResult.success ? "text-green-400" : "text-red-400"}`}
              >
                {sendResult.message}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => handleSend(true)}
            disabled={isSending}
            className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
          >
            Send Test
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSend(false)}
              disabled={isSending || !recipientEmail}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: "#2C5F2E" }}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invoice
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
