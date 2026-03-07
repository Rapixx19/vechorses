/**
 * FILE: modules/dashboard/components/AnimatedStatCard.tsx
 * ZONE: Green
 * PURPOSE: Animated stat card with visual elements and count-up animation
 * EXPORTS: AnimatedStatCard
 * DEPENDS ON: framer-motion, lucide-react
 * CONSUMED BY: DashboardPage
 * TESTS: modules/dashboard/tests/AnimatedStatCard.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for lively dashboard
 */

"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface AnimatedStatCardProps {
  title: string
  value: number
  icon: LucideIcon
  subtitle?: string
  delay?: number
  variant?: "horses" | "occupancy" | "tasks" | "billing"
  extra?: {
    total?: number
    occupied?: number
    completed?: number
    trend?: "up" | "down"
  }
  accentColor?: string
}

// BREADCRUMB: Count-up animation hook
function useCountUp(end: number, duration: number = 1000): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress)
      const current = Math.floor(startValue + (end - startValue) * eased)

      setCount(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration])

  return count
}

// Horse silhouette SVG
function HorseSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M21 8c-1 0-2 1-3 2-1-1-2-2-4-2s-3 1-4 2c-2 2-3 4-3 6v4h2v-2c0-1 .5-2 1.5-2.5.5 2 2 3.5 4.5 3.5s4-1.5 4.5-3.5c1 .5 1.5 1.5 1.5 2.5v2h2v-4c0-2-1-4-3-6zm-7 8c-1.5 0-2.5-1-2.5-2.5S12.5 11 14 11s2.5 1 2.5 2.5S15.5 16 14 16z" />
    </svg>
  )
}

// Mini stall grid for occupancy
function MiniStallGrid({ occupied, total }: { occupied: number; total: number }) {
  const maxDisplay = 12
  const displayCount = Math.min(total, maxDisplay)
  const occupiedCount = Math.min(occupied, displayCount)

  return (
    <div className="grid grid-cols-6 gap-0.5 mt-2">
      {Array.from({ length: displayCount }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-sm ${i < occupiedCount ? "bg-green-500" : "bg-gray-600"}`}
        />
      ))}
    </div>
  )
}

// Progress ring for tasks
function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const percentage = total > 0 ? (completed / total) * 100 : 0
  const radius = 16
  const stroke = 3
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-10 h-10">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth={stroke}
        />
        <motion.circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="#2C5F2E"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
        {completed}/{total}
      </span>
    </div>
  )
}

export function AnimatedStatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  delay = 0,
  variant,
  extra,
  accentColor = "#2C5F2E",
}: AnimatedStatCardProps) {
  const animatedValue = useCountUp(value, 1000)

  const renderVisual = () => {
    switch (variant) {
      case "horses": {
        // Show horse silhouettes for up to 8 horses
        const displayHorses = Math.min(value, 8)
        return (
          <div className="flex gap-1 mt-2">
            {Array.from({ length: displayHorses }).map((_, i) => (
              <HorseSilhouette key={i} className="w-4 h-4 text-green-500/60" />
            ))}
            {value > 8 && (
              <span className="text-xs text-gray-500 ml-1">+{value - 8}</span>
            )}
          </div>
        )
      }

      case "occupancy":
        if (extra?.occupied !== undefined && extra?.total !== undefined) {
          return <MiniStallGrid occupied={extra.occupied} total={extra.total} />
        }
        return null

      case "tasks":
        if (extra?.completed !== undefined && extra?.total !== undefined) {
          return (
            <div className="flex items-center gap-2 mt-2">
              <ProgressRing completed={extra.completed} total={extra.total} />
              <span className="text-xs text-gray-500">
                {extra.completed} done
              </span>
            </div>
          )
        }
        return null

      case "billing":
        return (
          <div className="flex items-center gap-1 mt-1">
            {extra?.trend && (
              <span
                className={`text-xs ${extra.trend === "up" ? "text-red-400" : "text-green-400"}`}
              >
                {extra.trend === "up" ? "↑" : "↓"}
              </span>
            )}
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="rounded-lg px-4 py-3 border border-[var(--border)] bg-gradient-to-br from-[#1A1A2E]/50 to-transparent"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--text-muted)]">{title}</span>
        <Icon className="h-4 w-4 opacity-60" style={{ color: accentColor }} />
      </div>
      <div className="text-xl font-semibold" style={{ color: accentColor }}>
        {variant === "billing" ? `€${animatedValue.toLocaleString()}` : animatedValue}
      </div>
      {subtitle && !variant && (
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
      )}
      {renderVisual()}
    </motion.div>
  )
}
