/**
 * FILE: components/ui/EmptyState.tsx
 * ZONE: Green
 * PURPOSE: Reusable empty state component for lists/grids with no data
 * EXPORTS: EmptyState, EmptyStateProps
 * DEPENDS ON: react, lucide-react, AppButton
 * CONSUMED BY: All modules requiring empty states
 * TESTS: components/ui/tests/EmptyState.test.tsx
 * LAST CHANGED: 2026-03-14 — Initial creation for UI consistency audit
 */

"use client"

import { Plus } from "lucide-react"
import { AppButton } from "./AppButton"

export interface EmptyStateProps {
  emoji?: string
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  emoji,
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        py-16 text-center px-6
        ${className}
      `}
    >
      {emoji && <div className="text-6xl mb-4">{emoji}</div>}
      {icon && !emoji && <div className="text-gray-500 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-xs mb-6">{description}</p>
      {actionLabel && onAction && (
        <AppButton onClick={onAction} leftIcon={<Plus className="h-4 w-4" />}>
          {actionLabel}
        </AppButton>
      )}
    </div>
  )
}

// Pre-configured empty states for common use cases

export function HorsesEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      emoji="🐴"
      title="No horses yet"
      description="Add your first horse to get started managing your stable."
      actionLabel="Add your first horse"
      onAction={onAdd}
    />
  )
}

export function ClientsEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      emoji="👤"
      title="No clients yet"
      description="Add clients to manage horse owners and their contact information."
      actionLabel="Add your first client"
      onAction={onAdd}
    />
  )
}

export function StaffEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      emoji="👥"
      title="No team members yet"
      description="Invite staff members to help manage your stable."
      actionLabel="Add team member"
      onAction={onAdd}
    />
  )
}

export function CalendarEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      emoji="📅"
      title="No events scheduled"
      description="Add events like vet visits, training sessions, and competitions."
      actionLabel="Add event"
      onAction={onAdd}
    />
  )
}

export function DocumentsEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      emoji="📄"
      title="No documents uploaded"
      description="Upload contracts, certificates, and other important documents."
      actionLabel="Upload document"
      onAction={onAdd}
    />
  )
}

export function BillingEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      emoji="💰"
      title="No invoices yet"
      description="Create invoices for your clients to track payments and revenue."
      actionLabel="Create invoice"
      onAction={onAdd}
    />
  )
}

export function ServicesEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      emoji="📋"
      title="No services yet"
      description="Define the services you offer like boarding, lessons, and grooming."
      actionLabel="Add service"
      onAction={onAdd}
    />
  )
}

export function TasksEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      emoji="✅"
      title="No tasks"
      description="All tasks have been completed. Great job!"
      actionLabel={onAdd ? "Add task" : undefined}
      onAction={onAdd}
    />
  )
}
