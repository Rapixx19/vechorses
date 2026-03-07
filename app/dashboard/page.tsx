/**
 * FILE: app/dashboard/page.tsx
 * ZONE: Green
 * PURPOSE: Dashboard page with loading timeout, error handling, and widgets
 * EXPORTS: default (DashboardPage)
 * DEPENDS ON: modules/dashboard, modules/horses, modules/clients, modules/stalls, modules/billing, modules/staff, modules/calendar
 * CONSUMED BY: Next.js routing
 * TESTS: app/dashboard/page.test.tsx
 * LAST CHANGED: 2026-03-07 — Fixed infinite loading, added timeout fallback
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { Rabbit, ListTodo, Grid3X3, Receipt } from "lucide-react"
import { useHorses, useTasks } from "@/modules/horses"
import { useClients } from "@/modules/clients"
import { useStalls } from "@/modules/stalls"
import { useBilling } from "@/modules/billing"
import { useStaff, useStaffTasks } from "@/modules/staff"
import { useCalendar } from "@/modules/calendar"
import {
  useTimeOfDay,
  AnimatedStatCard,
  StatusBanner,
  QuickActions,
  TodaysSchedule,
  StaffStatusWidget,
  HorsesGlance,
  RecentActivityFeed,
  Skeleton,
} from "@/modules/dashboard"

// BREADCRUMB: Loading timeout in milliseconds - show content after this even if loading
const LOADING_TIMEOUT = 5000

export default function DashboardPage() {
  const [timedOut, setTimedOut] = useState(false)

  // BREADCRUMB: Memoize date objects to prevent infinite re-renders
  const { today, todayStr, dateRange } = useMemo(() => {
    const now = new Date()
    return {
      today: now,
      todayStr: now.toISOString().split("T")[0],
      dateRange: {
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      },
    }
  }, [])

  // All hooks at top level - no conditional calls
  const { horses, isLoading: horsesLoading } = useHorses()
  const { clients, isLoading: clientsLoading } = useClients()
  const { stalls, isLoading: stallsLoading } = useStalls()
  const { tasks, isLoading: tasksLoading } = useTasks()
  const { items: billingItems, isLoading: billingLoading } = useBilling()
  const { staff, isLoading: staffLoading } = useStaff()
  const { tasks: staffTasks, isLoading: staffTasksLoading } = useStaffTasks()
  const { events, isLoading: eventsLoading } = useCalendar(dateRange)
  const { greeting, colors } = useTimeOfDay()

  // BREADCRUMB: Timeout fallback - show content after 5 seconds even if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true)
    }, LOADING_TIMEOUT)

    return () => clearTimeout(timer)
  }, [])

  const isLoading =
    !timedOut &&
    (horsesLoading ||
      clientsLoading ||
      stallsLoading ||
      tasksLoading ||
      billingLoading ||
      staffLoading ||
      staffTasksLoading ||
      eventsLoading)

  const formattedDate = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // Calculate stats with safe defaults
  const safeHorses = horses || []
  const safeTasks = tasks || []
  const safeStalls = stalls || []
  const safeBillingItems = billingItems || []
  const safeStaff = staff || []
  const safeStaffTasks = staffTasks || []
  const safeEvents = events || []
  const safeClients = clients || []

  const todaysTasks = safeTasks.filter((t) => t.dueDate === todayStr && !t.completedAt)
  const completedTodayTasks = safeTasks.filter((t) => t.dueDate === todayStr && t.completedAt)
  const overdueTasks = safeTasks.filter((t) => t.dueDate < todayStr && !t.completedAt)
  const occupiedStalls = safeStalls.filter((s) => s.horseId !== null).length
  const pendingBillingCents = safeBillingItems
    .filter((b) => b.status === "pending")
    .reduce((sum, b) => sum + b.amountCents, 0)
  const pendingInvoices = safeBillingItems.filter((b) => b.status === "pending").length
  const lowOccupancy = safeStalls.length > 0 && occupiedStalls / safeStalls.length < 0.5

  const handleGenerateInvoice = async () => {
    try {
      const res = await fetch("/api/generate-invoices", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        alert(`Generated ${data.count} invoice(s) successfully!`)
      } else {
        alert(`Failed: ${data.error}`)
      }
    } catch {
      alert("Failed to generate invoices")
    }
  }

  // Show skeleton loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <Skeleton className="h-24 sm:h-28" />
          <Skeleton className="h-24 sm:h-28" />
          <Skeleton className="h-24 sm:h-28" />
          <Skeleton className="h-24 sm:h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 bg-gradient-to-b ${colors.gradient}`}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold" style={{ color: colors.accent }}>
          {greeting}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{formattedDate}</p>
      </div>

      {/* Status Banner */}
      <StatusBanner
        overdueTasks={overdueTasks.length}
        pendingInvoices={pendingInvoices}
        lowOccupancy={lowOccupancy}
      />

      {/* Quick Actions */}
      <QuickActions onGenerateInvoice={handleGenerateInvoice} />

      {/* Stat Cards - 2x2 on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <AnimatedStatCard
          title="Active Horses"
          value={safeHorses.filter((h) => h.isActive).length}
          icon={Rabbit}
          delay={0}
          variant="horses"
          accentColor={colors.accent}
        />
        <AnimatedStatCard
          title="Tasks Today"
          value={todaysTasks.length + completedTodayTasks.length}
          icon={ListTodo}
          delay={1}
          variant="tasks"
          extra={{ completed: completedTodayTasks.length, total: todaysTasks.length + completedTodayTasks.length }}
          accentColor={colors.accent}
        />
        <AnimatedStatCard
          title="Stall Occupancy"
          value={occupiedStalls}
          icon={Grid3X3}
          delay={2}
          variant="occupancy"
          extra={{ occupied: occupiedStalls, total: safeStalls.length }}
          accentColor={colors.accent}
        />
        <AnimatedStatCard
          title="Pending Billing"
          value={Math.round(pendingBillingCents / 100)}
          icon={Receipt}
          delay={3}
          variant="billing"
          extra={{ trend: pendingBillingCents > 0 ? "up" : undefined }}
          accentColor={colors.accent}
        />
      </div>

      {/* Two Column Layout - Schedule and Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TodaysSchedule events={safeEvents} />
        <StaffStatusWidget staff={safeStaff} />
      </div>

      {/* Horses at a Glance */}
      <HorsesGlance horses={safeHorses} clients={safeClients} stalls={safeStalls} tasks={safeTasks} />

      {/* Recent Activity */}
      <RecentActivityFeed
        horses={safeHorses}
        clients={safeClients}
        billingItems={safeBillingItems}
        tasks={safeTasks}
        events={safeEvents}
        staffTasks={safeStaffTasks}
      />
    </div>
  )
}
