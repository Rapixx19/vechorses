/**
 * FILE: modules/onboarding/components/steps/InviteTeamStep.tsx
 * ZONE: Green
 * PURPOSE: Invite team step for onboarding
 * EXPORTS: InviteTeamStep
 * DEPENDS ON: lib/supabase
 * CONSUMED BY: OnboardingWizard
 * TESTS: None
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { UserPlus, ChevronLeft, ChevronRight, Copy, Check, Share2 } from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { OnboardingStepProps } from "../OnboardingWizard"

export function InviteTeamStep({ onNext, onBack, onSkip, stableId }: OnboardingStepProps) {
  const supabase = useMemo(() => createClient(), [])
  const [referralCode, setReferralCode] = useState("")
  const [copied, setCopied] = useState(false)

  // Load referral code
  useEffect(() => {
    if (!stableId) return

    async function loadCode() {
      const { data } = await supabase
        .from("stables")
        .select("referral_code")
        .eq("id", stableId)
        .single()

      if (data?.referral_code) {
        setReferralCode(data.referral_code)
      }
    }

    loadCode()
  }, [stableId, supabase])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: "Join my stable on VecHorses",
      text: `Use this code to join my stable: ${referralCode}`,
      url: `${window.location.origin}/join?code=${referralCode}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        handleCopy()
      }
    } catch (err) {
      // User cancelled share
    }
  }

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join` : "/join"

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#2C5F2E]/20 flex items-center justify-center">
          <UserPlus className="h-6 w-6 text-[#2C5F2E]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Invite your team members</h2>
          <p className="text-gray-400 text-sm">Share your stable code with your team</p>
        </div>
      </div>

      {/* Referral code card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1A2E] rounded-xl p-6 mb-6 border border-gray-800"
      >
        <p className="text-sm text-gray-400 mb-3 text-center">Your Stable&apos;s Invite Code</p>

        <div className="bg-[#252538] rounded-lg p-4 mb-4">
          <p className="text-2xl font-mono font-bold text-white text-center tracking-wider">
            {referralCode || "Loading..."}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            disabled={!referralCode}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#252538] text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Code
              </>
            )}
          </button>
          <button
            onClick={handleShare}
            disabled={!referralCode}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#2C5F2E" }}
          >
            <Share2 className="h-4 w-4" />
            Share Link
          </button>
        </div>
      </motion.div>

      {/* Instructions */}
      <div className="bg-[#252538] rounded-xl p-4 mb-6 border border-gray-700">
        <h3 className="text-sm font-medium text-white mb-2">How it works</h3>
        <ol className="text-sm text-gray-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#2C5F2E]/20 text-[#2C5F2E] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </span>
            Share this code with your team members
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#2C5F2E]/20 text-[#2C5F2E] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </span>
            They register at{" "}
            <code className="px-1 py-0.5 rounded bg-[#1A1A2E] text-xs">{joinUrl}</code>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#2C5F2E]/20 text-[#2C5F2E] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </span>
            They enter this code to join your stable
          </li>
        </ol>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <button onClick={onSkip} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Skip
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-1 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#2C5F2E" }}
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
