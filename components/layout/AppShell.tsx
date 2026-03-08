/**
 * FILE: components/layout/AppShell.tsx
 * ZONE: Green
 * PURPOSE: Main layout shell with responsive sidebar, mobile bottom nav, and drawer
 * EXPORTS: AppShell
 * DEPENDS ON: lucide-react, next/link, next/navigation, lib/hooks/useAuth, lib/hooks/useMediaQuery
 * CONSUMED BY: components/layout/AuthLayout.tsx
 * TESTS: components/layout/AppShell.test.tsx
 * LAST CHANGED: 2026-03-07 — Full mobile responsiveness with bottom nav and drawer
 */

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Sparkles,
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
  Menu,
  X,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/useAuth"
import { useIsMobile } from "@/lib/hooks/useMediaQuery"
import type { ModuleName } from "@/lib/types"

// BREADCRUMB: Nav items with module mapping for permission checks
const navItems: { href: string; label: string; icon: React.ElementType; module: ModuleName }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/assistant", label: "Assistant", icon: Sparkles, module: "assistant" },
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

// Bottom nav shows these 4 items + More
const bottomNavItems = navItems.slice(0, 4) // Dashboard, Horses, Clients, Staff
const moreNavItems = navItems.slice(4) // Calendar, Stalls, Billing, Services, Documents, Settings

const roleColors: Record<string, string> = {
  owner: "text-[var(--purple)] bg-[var(--purple)]/10",
  manager: "text-[var(--blue)] bg-[var(--blue)]/10",
  staff: "text-[#4ADE80] bg-[#4ADE80]/10",
  custom: "text-[var(--text-secondary)] bg-[var(--text-secondary)]/10",
}

function canViewModule(permissions: { module: string; canView: boolean }[] | undefined, module: string): boolean {
  if (!permissions || permissions.length === 0) return true
  const perm = permissions.find((p) => p.module === module)
  return perm?.canView ?? true
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { currentUser, logout } = useAuth()
  const isMobile = useIsMobile()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
    setMoreOpen(false)
  }, [pathname])

  // Close drawer when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false)
      setMoreOpen(false)
    }
  }, [isMobile])

  const visibleNavItems = navItems.filter((item) => canViewModule(currentUser?.permissions, item.module))
  const visibleBottomNavItems = bottomNavItems.filter((item) => canViewModule(currentUser?.permissions, item.module))
  const visibleMoreNavItems = moreNavItems.filter((item) => canViewModule(currentUser?.permissions, item.module))

  const initials =
    currentUser?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) || "?"

  const isActiveRoute = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-[var(--bg-primary)]">
        {/* Mobile Top Bar */}
        <header className="flex items-center justify-between px-4 h-14 border-b border-[var(--border)] bg-[var(--bg-primary)] safe-area-top">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-base font-semibold text-[var(--text-primary)]">
            {navItems.find((item) => isActiveRoute(item.href))?.label ?? "VecHorses"}
          </h1>
          <button
            className="relative p-2 -mr-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--red)] rounded-full" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 pb-20">{children}</main>

        {/* Mobile Bottom Navigation */}
        <nav
          className="fixed bottom-0 left-0 right-0 h-[60px] bg-[var(--bg-surface)] border-t border-[var(--border)] flex items-center justify-around z-40"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {visibleBottomNavItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveRoute(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 py-2 min-h-[44px]",
                  isActive ? "text-[var(--green-bright)]" : "text-[var(--text-muted)]"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            )
          })}
          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-2 min-h-[44px]",
              moreOpen || visibleMoreNavItems.some((i) => isActiveRoute(i.href))
                ? "text-[var(--green-bright)]"
                : "text-[var(--text-muted)]"
            )}
          >
            <MoreHorizontal className="h-6 w-6" />
            <span className="text-[10px] mt-1 font-medium">More</span>
          </button>
        </nav>

        {/* More Sheet (bottom) */}
        {moreOpen && (
          <div className="fixed inset-0 z-50" onClick={() => setMoreOpen(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="absolute bottom-0 left-0 right-0 bg-[var(--bg-surface)] rounded-t-2xl overflow-hidden"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <span className="text-base font-semibold text-[var(--text-primary)]">More</span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="p-2 -mr-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-2 grid grid-cols-3 gap-2">
                {visibleMoreNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveRoute(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl min-h-[80px]",
                        isActive
                          ? "bg-[var(--green-primary)] text-white"
                          : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      <Icon className="h-6 w-6 mb-2" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
              {/* User section */}
              <div className="p-4 mt-2 border-t border-[var(--border)]">
                <div className="flex items-center gap-3 mb-4">
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-[var(--red)] bg-[var(--red)]/10 hover:bg-[var(--red)]/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Drawer (left side) */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50" onClick={() => setDrawerOpen(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-[var(--bg-surface)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer header */}
              <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--border)] safe-area-top">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--green-primary)] flex items-center justify-center">
                    <Rabbit className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-[var(--text-primary)]">VecHorses</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 -mr-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer nav */}
              <nav className="p-3">
                <ul className="space-y-1">
                  {visibleNavItems.map((item) => {
                    const isActive = isActiveRoute(item.href)
                    const Icon = item.icon
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setDrawerOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px]",
                            isActive
                              ? "bg-[var(--green-primary)] text-white"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* Drawer user section */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border)] bg-[var(--bg-surface)]" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--green-primary)] flex items-center justify-center text-sm font-semibold text-white">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{currentUser?.fullName}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{currentUser?.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-[var(--red)] bg-[var(--red)]/10 hover:bg-[var(--red)]/20 transition-colors min-h-[44px]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop Layout (unchanged)
  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      {/* Sidebar - 220px width */}
      <aside
        className="flex-shrink-0 bg-[var(--bg-primary)] border-r border-[var(--border)]"
        style={{ width: "var(--sidebar-width)" }}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
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
                const isActive = isActiveRoute(item.href)
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

          {/* User Menu */}
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
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--bg-primary)]"
          style={{ height: "var(--topbar-height)" }}
        >
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            {navItems.find((item) => isActiveRoute(item.href))?.label ?? "VecHorses"}
          </h1>
          <div className="flex items-center gap-2">
            <button
              className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--red)] rounded-full" />
            </button>
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
