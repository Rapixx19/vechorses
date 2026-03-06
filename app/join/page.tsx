/**
 * FILE: app/join/page.tsx
 * ZONE: Green
 * PURPOSE: Join page for staff members with referral code
 * EXPORTS: default (page component)
 * DEPENDS ON: lib/hooks/useAuth.ts, next/link
 * CONSUMED BY: Next.js App Router
 * TESTS: None (route handler)
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { Loader2 } from "lucide-react"

export default function JoinPage() {
  const { joinWithCode, isLoading } = useAuth()
  const [code, setCode] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await joinWithCode(code, fullName, email, password)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Join failed"
      console.error("Join error:", message)
      setError(message)
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-[#252538] border border-[#3A3A52] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#2C5F2E] text-sm"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#0F1117" }}>
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2C5F2E] flex items-center justify-center">
            <span className="text-2xl font-bold text-white">V</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Join a stable</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Enter your referral code to join</p>
        </div>

        {/* Join Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Referral code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={inputClass}
              placeholder="ABCD1234"
              maxLength={8}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Your name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              placeholder="John Smith"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "#2C5F2E" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              "Join stable"
            )}
          </button>
        </form>

        {/* Back to login */}
        <div className="mt-6 text-center space-y-2">
          <Link href="/login" className="block text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            Already have an account? Sign in
          </Link>
          <Link href="/register" className="block text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            Want to create a new stable? Register
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-8">VecHorses — Stable Management</p>
      </div>
    </div>
  )
}
