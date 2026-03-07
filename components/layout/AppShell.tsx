/**
 * FILE: components/layout/AppShell.tsx
 * ZONE: Green
 * PURPOSE: Main layout shell with sidebar navigation, user menu, and permission-gated nav
 * EXPORTS: AppShell
 * DEPENDS ON: lucide-react, next/link, next/navigation, lib/hooks/useAuth
 * CONSUMED BY: components/layout/AuthLayout.tsx
 * TESTS: components/layout/AppShell.test.tsx
 * LAST CHANGED: 2026-03-07 — UI overhaul with new design system
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Rabbit,
  Users,
  Users2,
  Calendar,
  Grid3X3,
  Receipt,
  Tag,
  Settings,
  Bell,
  LogOut,
  ChevronUp,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/useAuth"
import type { ModuleName } from "@/lib/types"

// BREADCRUMB: Nav items with module mapping for permission checks
const navItems: { href: string; label: string; icon: React.ElementType; module: ModuleName }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/horses", label: "Horses", icon: Rabbit, module: "horses" },
  { href: "/clients", label: "Clients", icon: Users, module: "clients" },
  { href: "/staff", label: "Staff", icon: Users2, module: "staff" },
  { href: "/calendar", label: "Calendar", icon: Calendar, module: "calendar" },
  { href: "/stalls", label: "Stalls", icon: Grid3X3, module: "stalls" },
  { href: "/billing", label: "Billing", icon: Receipt, module: "billing" },
  { href: "/services", label: "Services", icon: Tag, module: "services" },
  { href: "/documents", label: "Documents", icon: FileText, module: "documents" },
  { href: "/settings", label: "Settings", icon: Settings, module: "settings" },
]

const roleColors: Record<string, string> = {
  owner: "text-[var(--purple)] bg-[var(--purple)]/10",
  manager: "text-[var(--blue)] bg-[var(--blue)]/10",
  staff: "text-[#4ADE80] bg-[#4ADE80]/10",
  custom: "text-[var(--text-secondary)] bg-[var(--text-secondary)]/10",
}

// BREADCRUMB: Helper to check permission without hook (for use in filter)
function canViewModule(permissions: { module: string; canView: boolean }[] | undefined, module: string): boolean {
  if (!permissions || permissions.length === 0) return true
  const perm = permissions.find((p) => p.module === module)
  return perm?.canView ?? true
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { currentUser, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const visibleNavItems = navItems.filter((item) => canViewModule(currentUser?.permissions, item.module))

  const initials =
    currentUser?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) || "?"

  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      {/* Sidebar - 220px width */}
      <aside
        className="flex-shrink-0 bg-[var(--bg-primary)] border-r border-[var(--border)]"
        style={{ width: "var(--sidebar-width)" }}
      >
        <div className="flex flex-col h-full">
          {/* Logo area - more breathing room */}
          <div className="h-16 flex items-center px-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--green-primary)] flex items-center justify-center">
                <Rabbit className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)]">VecHorses</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 overflow-y-auto">
            <ul className="space-y-1">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                        isActive
                          ? "bg-[var(--green-primary)] text-white"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      {/* Active indicator - subtle left border */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--green-bright)] rounded-r-full" />
                      )}
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Menu - bottom area */}
          <div className="p-3 border-t border-[var(--border)] relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--green-primary)] flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{currentUser?.fullName}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{currentUser?.email}</p>
              </div>
              <ChevronUp
                className={cn(
                  "h-4 w-4 text-[var(--text-muted)] transition-transform flex-shrink-0",
                  showUserMenu ? "" : "rotate-180"
                )}
              />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-3 right-3 mb-2 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] shadow-lg">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[var(--border)]">
                  <div className="w-10 h-10 rounded-full bg-[var(--green-primary)] flex items-center justify-center text-sm font-semibold text-white">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{currentUser?.fullName}</p>
                    <span
                      className={cn(
                        "inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
                        roleColors[currentUser?.role || "custom"]
                      )}
                    >
                      {currentUser?.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--red)] hover:bg-[var(--red)]/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - 56px height */}
        <header
          className="flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--bg-primary)]"
          style={{ height: "var(--topbar-height)" }}
        >
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            {navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ??
              "VecHorses"}
          </h1>
          <div className="flex items-center gap-2">
            <button
              className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--red)] rounded-full" />
            </button>
            {/* Avatar in topbar */}
            <div className="w-8 h-8 rounded-full bg-[var(--green-primary)] flex items-center justify-center text-xs font-semibold text-white">
              {initials}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6 bg-[var(--bg-primary)]">{children}</main>
      </div>
    </div>
  )
}
