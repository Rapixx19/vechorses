/**
 * FILE: components/ui/index.ts
 * ZONE: Green
 * PURPOSE: Public API for shared UI components
 * EXPORTS: All UI primitives
 * DEPENDS ON: ./AppButton, ./AppInput, ./AppCard, ./StatusBadge, ./PageSkeleton, ./EmptyState, ./PageHeader, ./SearchInput
 * CONSUMED BY: All modules
 * TESTS: components/ui/tests/
 * LAST CHANGED: 2026-03-14 — Added new UI consistency components
 */

// Buttons
export { AppButton } from "./AppButton"
export type { AppButtonProps } from "./AppButton"

// Inputs
export { AppInput } from "./AppInput"
export type { AppInputProps } from "./AppInput"

// Cards
export { AppCard } from "./AppCard"
export type { AppCardProps } from "./AppCard"

// Status Badges
export {
  StatusBadge,
  getInvoiceStatusVariant,
  getTaskStatusVariant,
  getStaffStatusVariant,
} from "./StatusBadge"
export type { StatusBadgeProps, BadgeVariant } from "./StatusBadge"

// Skeletons / Loading
export {
  PageSkeleton,
  SkeletonCard,
  SkeletonText,
  SkeletonAvatar,
  SkeletonTable,
  SkeletonPulse,
  DashboardSkeleton,
} from "./PageSkeleton"

// Empty States
export {
  EmptyState,
  HorsesEmptyState,
  ClientsEmptyState,
  StaffEmptyState,
  CalendarEmptyState,
  DocumentsEmptyState,
  BillingEmptyState,
  ServicesEmptyState,
  TasksEmptyState,
} from "./EmptyState"
export type { EmptyStateProps } from "./EmptyState"

// Page Layout
export { PageHeader } from "./PageHeader"
export type { PageHeaderProps } from "./PageHeader"

// Search
export { SearchInput } from "./SearchInput"
export type { SearchInputProps } from "./SearchInput"
