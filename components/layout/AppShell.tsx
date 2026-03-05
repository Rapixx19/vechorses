/**
 * FILE: components/layout/AppShell.tsx
 * ZONE: Green
 * PURPOSE: Main layout shell with sidebar navigation and header
 * EXPORTS: AppShell
 * DEPENDS ON: lucide-react, next/link, next/navigation
 * CONSUMED BY: app/layout.tsx
 * TESTS: components/layout/AppShell.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Rabbit,
  Users,
  Grid3X3,
  Receipt,
  Settings,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"

// BREADCRUMB: Nav items define the sidebar menu structure
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/horses", label: "Horses", icon: Rabbit },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/stalls", label: "Stalls", icon: Grid3X3 },
  { href: "/billing", label: "Billing", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()

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
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#2C5F2E] text-white"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-[#0F1117]">
          <h1 className="text-lg font-semibold text-foreground">
            {navItems.find(
              (item) =>
                pathname === item.href || pathname.startsWith(`${item.href}/`)
            )?.label ?? "VecHorses"}
          </h1>

          {/* Notification bell placeholder */}
          <button
            className="p-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
