/**
 * FILE: components/layout/AppShell.tsx
 * ZONE: Green
 * PURPOSE: Main layout shell with sidebar navigation, user menu, and permission-gated nav
 * EXPORTS: AppShell
 * DEPENDS ON: lucide-react, next/link, next/navigation, lib/hooks/useAuth
 * CONSUMED BY: components/layout/AuthLayout.tsx
 * TESTS: components/layout/AppShell.test.tsx
 * LAST CHANGED: 2026-03-06 — Added user menu and permission-based nav hiding
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Rabbit, Users, Users2, Grid3X3, Receipt, Tag, Settings, Bell, LogOut, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/useAuth"
import type { ModuleName } from "@/lib/types"

// BREADCRUMB: Nav items with module mapping for permission checks
const navItems: { href: string; label: string; icon: React.ElementType; module: ModuleName }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/horses", label: "Horses", icon: Rabbit, module: "horses" },
  { href: "/clients", label: "Clients", icon: Users, module: "clients" },
  { href: "/staff", label: "Staff", icon: Users2, module: "staff" },
  { href: "/stalls", label: "Stalls", icon: Grid3X3, module: "stalls" },
  { href: "/billing", label: "Billing", icon: Receipt, module: "billing" },
  { href: "/services", label: "Services", icon: Tag, module: "services" },
  { href: "/settings", label: "Settings", icon: Settings, module: "settings" },
]

const roleColors: Record<string, string> = {
  owner: "bg-purple-500/20 text-purple-400",
  manager: "bg-blue-500/20 text-blue-400",
  staff: "bg-green-500/20 text-green-400",
  custom: "bg-gray-500/20 text-gray-400",
}

// BREADCRUMB: Helper to check permission without hook (for use in filter)
// Returns true if no permissions defined (owner sees all) or if canView is true for module
function canViewModule(permissions: { module: string; canView: boolean }[] | undefined, module: string): boolean {
  if (!permissions || permissions.length === 0) return true // No restrictions = show all
  const perm = permissions.find((p) => p.module === module)
  return perm?.canView ?? true // Default to visible if not explicitly restricted
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { currentUser, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter((item) => canViewModule(currentUser?.permissions, item.module))

  const initials = currentUser?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#0F1117] border-r border-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <span className="text-xl font-bold text-foreground">VecHorses</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3">
            <ul className="space-y-1">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors", isActive ? "bg-[#2C5F2E] text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
                      <Icon className="h-5 w-5" />{item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Menu */}
          <div className="p-3 border-t border-border relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#2C5F2E] flex items-center justify-center text-xs font-medium text-white">{initials}</div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{currentUser?.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
              </div>
              <ChevronUp className={cn("h-4 w-4 text-muted-foreground transition-transform", showUserMenu ? "" : "rotate-180")} />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-3 right-3 mb-2 p-3 rounded-lg bg-[#1A1A2E] border border-border shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-foreground">{currentUser?.fullName}</span>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium capitalize", roleColors[currentUser?.role || "custom"])}>{currentUser?.role}</span>
                </div>
                <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut className="h-4 w-4" />Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-[#0F1117]">
          <h1 className="text-lg font-semibold text-foreground">{navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ?? "VecHorses"}</h1>
          <button className="p-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" aria-label="Notifications"><Bell className="h-5 w-5" /></button>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-background">{children}</main>
      </div>
    </div>
  )
}
