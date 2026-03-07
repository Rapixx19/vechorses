/**
 * FILE: modules/staff/index.ts
 * ZONE: Green
 * PURPOSE: Public API for the staff module
 * EXPORTS: useStaff, useStaffTasks, StaffPage, StaffCard, StaffDetail, etc.
 * DEPENDS ON: ./hooks/*, ./components/*
 * CONSUMED BY: app/staff/*, modules/dashboard
 * TESTS: modules/staff/tests/
 * LAST CHANGED: 2026-03-07 — Initial creation for staff management
 */

// BREADCRUMB: Module boundary — only export from here, never import subfolders directly

// Hooks
export {
  useStaff,
  useStaffTasks,
  useAddStaff,
  useUpdateStaff,
  useStaffActions,
  type AddStaffInput,
  type AssignTaskInput,
} from "./hooks/useStaff"

// Components
export { StaffPage } from "./components/StaffPage"
export { StaffCard } from "./components/StaffCard"
export { StaffDetail } from "./components/StaffDetail"
export { StaffForm } from "./components/StaffForm"
export { TaskAssignSheet } from "./components/TaskAssignSheet"
