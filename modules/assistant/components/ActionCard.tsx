/**
 * FILE: modules/assistant/components/ActionCard.tsx
 * ZONE: Green
 * PURPOSE: Visual card showing AI actions taken (events, clients, etc.)
 * EXPORTS: ActionCard
 * DEPENDS ON: lucide-react, next/link
 * CONSUMED BY: MessageBubble
 * TESTS: modules/assistant/tests/ActionCard.test.tsx
 * LAST CHANGED: 2026-03-08 — Initial creation
 */

"use client"

import Link from "next/link"
import {
  Calendar,
  UserPlus,
  Users,
  FileSearch,
  CheckSquare,
  Receipt,
  Undo2,
} from "lucide-react"

interface ActionCardProps {
  type: string
  data: Record<string, unknown>
  onUndo?: () => void
}

// BREADCRUMB: Maps action types to visual card configurations
const actionConfigs: Record<
  string,
  {
    icon: React.ElementType
    title: string
    bgColor: string
    textColor: string
    href?: (data: Record<string, unknown>) => string
  }
> = {
  ADD_CALENDAR_EVENT: {
    icon: Calendar,
    title: "Event Scheduled",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-400",
    href: () => "/calendar",
  },
  ADD_CLIENT: {
    icon: UserPlus,
    title: "Client Added",
    bgColor: "bg-green-500/10",
    textColor: "text-green-400",
    href: (data) => `/clients/${data.clientId || ""}`,
  },
  UPDATE_STAFF_STATUS: {
    icon: Users,
    title: "Status Updated",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-400",
    href: () => "/staff",
  },
  FIND_DOCUMENT: {
    icon: FileSearch,
    title: "Document Found",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
    href: () => "/documents",
  },
  CREATE_TASK: {
    icon: CheckSquare,
    title: "Task Created",
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-400",
    href: () => "/staff",
  },
  CREATE_INVOICE: {
    icon: Receipt,
    title: "Invoice Created",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
    href: () => "/billing",
  },
}

export function ActionCard({ type, data, onUndo }: ActionCardProps) {
  const config = actionConfigs[type]

  if (!config) {
    return null
  }

  const Icon = config.icon
  const viewHref = config.href?.(data)

  // Format data for display
  const formatValue = (key: string, value: unknown): string => {
    if (value === null || value === undefined) return ""
    if (typeof value === "string") return value
    if (typeof value === "number") return value.toString()
    if (value instanceof Date) return value.toLocaleDateString()
    return JSON.stringify(value)
  }

  // Get display fields based on action type
  const getDisplayFields = (): { label: string; value: string }[] => {
    const fields: { label: string; value: string }[] = []

    switch (type) {
      case "ADD_CALENDAR_EVENT":
        if (data.title) fields.push({ label: "", value: formatValue("title", data.title) })
        if (data.date) fields.push({ label: "Date", value: formatValue("date", data.date) })
        if (data.time) fields.push({ label: "Time", value: formatValue("time", data.time) })
        if (data.clientName) fields.push({ label: "Client", value: formatValue("clientName", data.clientName) })
        break
      case "ADD_CLIENT":
        if (data.name) fields.push({ label: "", value: formatValue("name", data.name) })
        if (data.email) fields.push({ label: "Email", value: formatValue("email", data.email) })
        break
      case "UPDATE_STAFF_STATUS":
        if (data.staffName) fields.push({ label: "", value: formatValue("staffName", data.staffName) })
        if (data.status) fields.push({ label: "Status", value: formatValue("status", data.status) })
        break
      case "FIND_DOCUMENT":
        if (data.documentName) fields.push({ label: "", value: formatValue("documentName", data.documentName) })
        if (data.documentType) fields.push({ label: "Type", value: formatValue("documentType", data.documentType) })
        break
      case "CREATE_TASK":
        if (data.title) fields.push({ label: "", value: formatValue("title", data.title) })
        if (data.assignedTo) fields.push({ label: "Assigned", value: formatValue("assignedTo", data.assignedTo) })
        if (data.dueDate) fields.push({ label: "Due", value: formatValue("dueDate", data.dueDate) })
        break
      case "CREATE_INVOICE":
        if (data.clientName) fields.push({ label: "", value: formatValue("clientName", data.clientName) })
        if (data.amount) fields.push({ label: "Amount", value: formatValue("amount", data.amount) })
        break
      default:
        Object.entries(data).slice(0, 3).forEach(([key, value]) => {
          fields.push({ label: key, value: formatValue(key, value) })
        })
    }

    return fields
  }

  const displayFields = getDisplayFields()

  return (
    <div className={`p-3 rounded-lg border border-[var(--border)] ${config.bgColor}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <Icon className={`h-4 w-4 ${config.textColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium ${config.textColor}`}>{config.title}</p>
          {displayFields.map((field, idx) => (
            <p key={idx} className="text-sm text-[var(--text-primary)] truncate">
              {field.label ? `${field.label}: ${field.value}` : field.value}
            </p>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        {viewHref && (
          <Link
            href={viewHref}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            View
          </Link>
        )}
        {onUndo && (
          <button
            onClick={onUndo}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Undo2 className="h-3 w-3" />
            Undo
          </button>
        )}
      </div>
    </div>
  )
}
