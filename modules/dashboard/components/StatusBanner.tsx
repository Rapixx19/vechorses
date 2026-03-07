/**
 * FILE: modules/dashboard/components/StatusBanner.tsx
 * ZONE: Green
 * PURPOSE: Status banner showing alerts and notifications
 * EXPORTS: StatusBanner
 * DEPENDS ON: framer-motion, lucide-react
 * CONSUMED BY: DashboardPage
 * TESTS: modules/dashboard/tests/StatusBanner.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for lively dashboard
 */

"use client"

import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, AlertTriangle, XCircle } from "lucide-react"

interface StatusBannerProps {
  overdueTasks: number
  pendingInvoices: number
  lowOccupancy: boolean
  className?: string
}

type StatusType = "success" | "warning" | "error" | "info"

interface StatusItem {
  type: StatusType
  message: string
  icon: React.ReactNode
}

// BREADCRUMB: Generate status items based on data
function getStatusItems(props: StatusBannerProps): StatusItem[] {
  const items: StatusItem[] = []

  if (props.overdueTasks > 0) {
    items.push({
      type: "error",
      message: `${props.overdueTasks} task${props.overdueTasks > 1 ? "s" : ""} overdue`,
      icon: <XCircle className="h-4 w-4" />,
    })
  }

  if (props.pendingInvoices > 0) {
    items.push({
      type: "warning",
      message: `${props.pendingInvoices} invoice${props.pendingInvoices > 1 ? "s" : ""} pending`,
      icon: <AlertTriangle className="h-4 w-4" />,
    })
  }

  if (props.lowOccupancy) {
    items.push({
      type: "info",
      message: "Low stall occupancy - consider marketing",
      icon: <AlertCircle className="h-4 w-4" />,
    })
  }

  if (items.length === 0) {
    items.push({
      type: "success",
      message: "All systems running smoothly",
      icon: <CheckCircle className="h-4 w-4" />,
    })
  }

  return items
}

const typeStyles: Record<StatusType, string> = {
  success: "bg-green-900/20 border-green-600/30 text-green-400",
  warning: "bg-yellow-900/20 border-yellow-600/30 text-yellow-400",
  error: "bg-red-900/20 border-red-600/30 text-red-400",
  info: "bg-blue-900/20 border-blue-600/30 text-blue-400",
}

export function StatusBanner(props: StatusBannerProps) {
  const statusItems = getStatusItems(props)
  const primaryStatus = statusItems[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border p-3 ${typeStyles[primaryStatus.type]} ${props.className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{primaryStatus.icon}</div>
        <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          {statusItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {i > 0 && item.icon}
              <span>{item.message}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
