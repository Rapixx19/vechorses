/**
 * FILE: app/dashboard/page.tsx
 * ZONE: Green
 * PURPOSE: Lively dashboard page with animations, status banner, and widgets
 * EXPORTS: default (DashboardPage)
 * DEPENDS ON: modules/dashboard, modules/horses, modules/clients, modules/stalls, modules/billing, modules/staff, modules/calendar
 * CONSUMED BY: Next.js routing
 * TESTS: app/dashboard/page.test.tsx
 * LAST CHANGED: 2026-03-07 — Redesigned with lively dashboard components
 */

"use client"

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
} from "@/modules/dashboard"

export default function DashboardPage() {
  const { horses, isLoading: horsesLoading } = useHorses()
  const { clients, isLoading: clientsLoading } = useClients()
  const { stalls, isLoading: stallsLoading } = useStalls()
  const { tasks, isLoading: tasksLoading } = useTasks()
  const { items: billingItems, isLoading: billingLoading } = useBilling()
  const { staff, isLoading: staffLoading } = useStaff()
  const { tasks: staffTasks, isLoading: staffTasksLoading } = useStaffTasks()

  // BREADCRUMB: Fetch today's calendar events for schedule widget
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]
  const { events, isLoading: eventsLoading } = useCalendar({
    startDate: today,
    endDate: new Date(today.getTime() + 86400000),
  })

  // Time of day theming
  const { greeting, colors } = useTimeOfDay()

  const isLoading =
    horsesLoading ||
    clientsLoading ||
    stallsLoading ||
    tasksLoading ||
    billingLoading ||
    staffLoading ||
    staffTasksLoading ||
    eventsLoading

  const formattedDate = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // Calculate stats
  const todaysTasks = tasks.filter((t) => t.dueDate === todayStr && !t.completedAt)
  const completedTodayTasks = tasks.filter((t) => t.dueDate === todayStr && t.completedAt)
  const overdueTasks = tasks.filter((t) => t.dueDate < todayStr && !t.completedAt)
  const occupiedStalls = stalls.filter((s) => s.horseId !== null).length
  const pendingBillingCents = billingItems
    .filter((b) => b.status === "pending")
    .reduce((sum, b) => sum + b.amountCents, 0)
  const pendingInvoices = billingItems.filter((b) => b.status === "pending").length

  // Low occupancy threshold
  const lowOccupancy = stalls.length > 0 && occupiedStalls / stalls.length < 0.5

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.accent }} />
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <AnimatedStatCard
          title="Active Horses"
          value={horses.filter((h) => h.isActive).length}
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
          extra={{ occupied: occupiedStalls, total: stalls.length }}
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
        <TodaysSchedule events={events} />
        <StaffStatusWidget staff={staff} />
      </div>

      {/* Horses at a Glance */}
      <HorsesGlance horses={horses} clients={clients} stalls={stalls} tasks={tasks} />

      {/* Recent Activity */}
      <RecentActivityFeed
        horses={horses}
        clients={clients}
        billingItems={billingItems}
        tasks={tasks}
        events={events}
        staffTasks={staffTasks}
      />
    </div>
  )
}
