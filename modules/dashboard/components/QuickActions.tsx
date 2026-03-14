/**
 * FILE: modules/dashboard/components/QuickActions.tsx
 * ZONE: Green
 * PURPOSE: Quick action buttons for common operations
 * EXPORTS: QuickActions
 * DEPENDS ON: framer-motion, lucide-react, next/link
 * CONSUMED BY: DashboardPage
 * TESTS: modules/dashboard/tests/QuickActions.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for lively dashboard
 */

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, Users, ClipboardList, FileText } from "lucide-react"

interface QuickActionsProps {
  onGenerateInvoice?: () => void
}

// BREADCRUMB: Quick action definitions
const actions = [
  { href: "/horses/new", label: "Add Horse", icon: Plus, color: "#2C5F2E" },
  { href: "/clients/new", label: "Add Client", icon: Users, color: "#3B82F6" },
  { href: "/staff", label: "Add Task", icon: ClipboardList, color: "#8B5CF6" },
  { action: "invoice", label: "Generate Invoice", icon: FileText, color: "#F59E0B" },
]

export function QuickActions({ onGenerateInvoice }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2"
    >
      {actions.map((action, i) => {
        const Icon = action.icon

        if (action.action === "invoice") {
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 * i }}
              onClick={onGenerateInvoice}
              className="flex items-center justify-center gap-2 px-3 py-3 min-h-[44px] rounded-lg text-sm font-medium bg-[#1A1A2E] text-gray-300 hover:text-white transition-colors border border-transparent hover:border-[#2a2a3e]"
            >
              <Icon className="h-4 w-4" style={{ color: action.color }} />
              {action.label}
            </motion.button>
          )
        }

        return (
          <Link key={action.label} href={action.href!}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 * i }}
              className="flex items-center justify-center gap-2 px-3 py-3 min-h-[44px] rounded-lg text-sm font-medium bg-[#1A1A2E] text-gray-300 hover:text-white transition-colors border border-transparent hover:border-[#2a2a3e] cursor-pointer"
            >
              <Icon className="h-4 w-4" style={{ color: action.color }} />
              {action.label}
            </motion.div>
          </Link>
        )
      })}
    </motion.div>
  )
}
