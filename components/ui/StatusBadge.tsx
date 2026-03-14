/**
 * FILE: components/ui/StatusBadge.tsx
 * ZONE: Green
 * PURPOSE: Reusable status badge with consistent styling for invoices, tasks, staff status
 * EXPORTS: StatusBadge, StatusBadgeProps, getInvoiceStatusVariant, getTaskStatusVariant, getStaffStatusVariant
 * DEPENDS ON: react
 * CONSUMED BY: Billing, Staff, Calendar, Dashboard modules
 * TESTS: components/ui/tests/StatusBadge.test.tsx
 * LAST CHANGED: 2026-03-14 — Initial creation for UI consistency audit
 */

"use client"

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "gray" | "purple"

export interface StatusBadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  size?: "sm" | "md"
  dot?: boolean
  className?: string
}

const badgeStyles: Record<BadgeVariant, string> = {
  success: "bg-green-500/15 text-green-400 border-green-500/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/15 text-red-400 border-red-500/20",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  gray: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
}

const dotColors: Record<BadgeVariant, string> = {
  success: "bg-green-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-blue-400",
  gray: "bg-gray-400",
  purple: "bg-purple-400",
}

const sizes = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-1",
}

export function StatusBadge({
  variant,
  children,
  size = "md",
  dot = false,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full
        border
        ${badgeStyles[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}

// Helper functions to map status values to badge variants

export function getInvoiceStatusVariant(
  status: string
): { variant: BadgeVariant; label: string } {
  switch (status) {
    case "paid":
      return { variant: "success", label: "Paid" }
    case "sent":
      return { variant: "info", label: "Sent" }
    case "draft":
      return { variant: "gray", label: "Draft" }
    case "cancelled":
      return { variant: "danger", label: "Cancelled" }
    case "overdue":
      return { variant: "danger", label: "Overdue" }
    case "pending":
      return { variant: "warning", label: "Pending" }
    case "invoiced":
      return { variant: "info", label: "Invoiced" }
    default:
      return { variant: "gray", label: status }
  }
}

export function getTaskStatusVariant(
  status: string
): { variant: BadgeVariant; label: string } {
  switch (status) {
    case "completed":
      return { variant: "success", label: "Completed" }
    case "in-progress":
      return { variant: "info", label: "In Progress" }
    case "pending":
      return { variant: "warning", label: "Pending" }
    case "overdue":
      return { variant: "danger", label: "Overdue" }
    case "cancelled":
      return { variant: "gray", label: "Cancelled" }
    default:
      return { variant: "gray", label: status }
  }
}

export function getStaffStatusVariant(
  status: string
): { variant: BadgeVariant; label: string } {
  switch (status) {
    case "working":
      return { variant: "success", label: "Working" }
    case "vacation":
      return { variant: "purple", label: "Vacation" }
    case "sick":
      return { variant: "danger", label: "Sick" }
    case "day-off":
      return { variant: "gray", label: "Day Off" }
    case "training":
      return { variant: "info", label: "Training" }
    default:
      return { variant: "gray", label: status }
  }
}
