/**
 * FILE: app/login/page.tsx
 * ZONE: Green
 * PURPOSE: Login page for authentication with registration options
 * EXPORTS: default (page component)
 * DEPENDS ON: lib/hooks/useAuth.ts, next/link
 * CONSUMED BY: Next.js App Router
 * TESTS: None (route handler)
 * LAST CHANGED: 2026-03-08 — Added Remember Me and fixed double login bug
 */

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load saved email on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("vechorses-email")
      if (savedEmail) {
        setEmail(savedEmail)
        setRememberMe(true)
      }
    }
  }, [])

  // Combined loading state
  const isLoading = authLoading || isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return // Prevent double submit

    setError("")
    setIsSubmitting(true)

    const { error: loginError } = await login(email, password, rememberMe)

    if (loginError) {
      setError(
        loginError.message === "Invalid login credentials" ? "Wrong email or password" : loginError.message
      )
      setIsSubmitting(false)
      return
    }

    // Success - hard navigate to avoid any state issues
    window.location.href = "/dashboard"
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-[#252538] border border-[#3A3A52] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#2C5F2E] text-sm"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#0F1117" }}>
      <div className="w-full max-w-sm">
        {/* Logo / Stable Name */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2C5F2E] flex items-center justify-center">
            <span className="text-2xl font-bold text-white">V</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Sign in to your stable account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@stable.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-green-500 cursor-pointer accent-[#2C5F2E]"
              />
              <span className="text-sm text-gray-400">Remember me</span>
            </label>
            <Link href="/reset-password" className="text-sm text-[#2C5F2E] hover:text-green-400 transition-colors">
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: "#2C5F2E" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#3A3A52]" />
          <span className="text-xs text-[var(--text-muted)]">or</span>
          <div className="flex-1 h-px bg-[#3A3A52]" />
        </div>

        {/* Registration Options */}
        <div className="space-y-3">
          <Link
            href="/register"
            className="w-full py-3 rounded-lg text-sm font-medium text-[var(--text-primary)] border border-[#3A3A52] hover:border-[#2C5F2E] flex items-center justify-center transition-colors"
          >
            Create a new stable account
          </Link>
          <Link
            href="/join"
            className="block text-center text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Joining an existing stable? Enter referral code →
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-8">VecHorses — Stable Management</p>
      </div>
    </div>
  )
}
