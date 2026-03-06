/**
 * FILE: app/dashboard/page.tsx
 * ZONE: Green
 * PURPOSE: Dashboard page with daily overview of stable operations
 * EXPORTS: default (DashboardPage)
 * DEPENDS ON: modules/dashboard, modules/horses, modules/clients, modules/stalls, modules/billing
 * CONSUMED BY: Next.js routing
 * TESTS: app/dashboard/page.test.tsx
 * LAST CHANGED: 2026-03-05 — Built full dashboard with stats and components
 */

"use client"

import { Rabbit, ListTodo, Grid3X3, Receipt } from "lucide-react"
import { useHorses, useTasks } from "@/modules/horses"
import { useClients } from "@/modules/clients"
import { useStalls } from "@/modules/stalls"
import { useBilling } from "@/modules/billing"
import {
  StatCard,
  TaskChecklist,
  OccupancyBar,
  RecentBilling,
  OverdueTasks,
} from "@/modules/dashboard"

export default function DashboardPage() {
  const horses = useHorses()
  const clients = useClients()
  const stalls = useStalls()
  const tasks = useTasks()
  const billingItems = useBilling()

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]
  const formattedDate = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // Calculate stats
  const todaysTasks = tasks.filter(
    (t) => t.dueDate === todayStr && !t.completedAt
  )
  const occupiedStalls = stalls.filter((s) => s.horseId !== null).length
  const pendingBillingCents = billingItems
    .filter((b) => b.status === "pending")
    .reduce((sum, b) => sum + b.amountCents, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Good morning
        </h2>
        <p className="text-[var(--text-muted)]">{formattedDate}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Horses"
          value={horses.length}
          icon={Rabbit}
          subtitle="in stable"
        />
        <StatCard
          title="Tasks Today"
          value={todaysTasks.length}
          icon={ListTodo}
          subtitle="pending"
        />
        <StatCard
          title="Stall Occupancy"
          value={`${occupiedStalls}/${stalls.length}`}
          icon={Grid3X3}
        />
        <StatCard
          title="Pending Billing"
          value={`€${(pendingBillingCents / 100).toLocaleString()}`}
          icon={Receipt}
          subtitle="awaiting payment"
        />
      </div>

      {/* Occupancy Bar */}
      <OccupancyBar occupied={occupiedStalls} total={stalls.length} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TaskChecklist tasks={tasks} horses={horses} />
        <OverdueTasks tasks={tasks} horses={horses} />
      </div>

      {/* Recent Billing */}
      <RecentBilling billingItems={billingItems} clients={clients} />
    </div>
  )
}
