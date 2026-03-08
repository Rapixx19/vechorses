/**
 * FILE: modules/settings/index.ts
 * ZONE: Yellow
 * PURPOSE: Public API for settings module
 * EXPORTS: TeamManager, InviteMemberForm, EditMemberForm, WhatsAppSettings, useTeam, useAddTeamMember, useUpdateTeamMember, useDeleteTeamMember, getDefaultPermissions
 * DEPENDS ON: ./components/*, ./hooks/*
 * CONSUMED BY: app/settings/page.tsx
 * TESTS: None (re-export only)
 * LAST CHANGED: 2026-03-08 — Added WhatsAppSettings component
 */

// Page components
export { SettingsPage } from "./components/SettingsPage"

// Components
export { TeamManager } from "./components/TeamManager"
export { InviteMemberForm } from "./components/InviteMemberForm"
export { EditMemberForm } from "./components/EditMemberForm"
export { WhatsAppSettings } from "./components/WhatsAppSettings"

// Hooks
export { useTeam, useAddTeamMember, useUpdateTeamMember, useDeleteTeamMember, getDefaultPermissions } from "./hooks/useTeam"
