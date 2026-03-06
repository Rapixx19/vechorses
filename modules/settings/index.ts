/**
 * FILE: modules/settings/index.ts
 * ZONE: Yellow
 * PURPOSE: Public API for settings module
 * EXPORTS: TeamManager, InviteMemberForm, EditMemberForm, useTeam, useAddTeamMember, useUpdateTeamMember, useDeleteTeamMember, getDefaultPermissions
 * DEPENDS ON: ./components/*, ./hooks/*
 * CONSUMED BY: app/settings/page.tsx
 * TESTS: None (re-export only)
 * LAST CHANGED: 2026-03-06 — Initial creation for team management
 */

// Components
export { TeamManager } from "./components/TeamManager"
export { InviteMemberForm } from "./components/InviteMemberForm"
export { EditMemberForm } from "./components/EditMemberForm"

// Hooks
export { useTeam, useAddTeamMember, useUpdateTeamMember, useDeleteTeamMember, getDefaultPermissions } from "./hooks/useTeam"
