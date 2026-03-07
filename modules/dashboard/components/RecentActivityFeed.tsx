/**
 * FILE: modules/dashboard/components/RecentActivityFeed.tsx
 * ZONE: Green
 * PURPOSE: Recent activity feed showing last 10 actions
 * EXPORTS: RecentActivityFeed
 * DEPENDS ON: framer-motion, lucide-react
 * CONSUMED BY: DashboardPage
 * TESTS: modules/dashboard/tests/RecentActivityFeed.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for lively dashboard
 */

"use client"

import { motion } from "framer-motion"
import { Activity, Rabbit, Users, Receipt, CheckCircle, Calendar, ClipboardList } from "lucide-react"
import type { Horse, Client, BillingLineItem, Task, CalendarEvent, StaffTask } from "@/lib/types"

interface RecentActivityFeedProps {
  horses: Horse[]
  clients: Client[]
  billingItems: BillingLineItem[]
  tasks: Task[]
  events: CalendarEvent[]
  staffTasks: StaffTask[]
}

interface ActivityItem {
  id: string
  type: "horse" | "client" | "invoice" | "task" | "event" | "staffTask"
  action: string
  subject: string
  timestamp: Date
}

// BREADCRUMB: Build activity list from various data sources
function buildActivityList(props: RecentActivityFeedProps): ActivityItem[] {
  const activities: ActivityItem[] = []

  // Horses added
  props.horses.forEach((horse) => {
    activities.push({
      id: `horse-${horse.id}`,
      type: "horse",
      action: "Horse added",
      subject: horse.name,
      timestamp: new Date(horse.createdAt),
    })
  })

  // Clients added
  props.clients.forEach((client) => {
    activities.push({
      id: `client-${client.id}`,
      type: "client",
      action: "Client added",
      subject: client.fullName,
      timestamp: new Date(client.createdAt),
    })
  })

  // Invoices sent/paid
  props.billingItems.forEach((item) => {
    if (item.status === "paid" || item.status === "invoiced") {
      activities.push({
        id: `billing-${item.id}`,
        type: "invoice",
        action: item.status === "paid" ? "Payment received" : "Invoice sent",
        subject: `€${(item.amountCents / 100).toFixed(2)}`,
        timestamp: new Date(item.createdAt),
      })
    }
  })

  // Tasks completed
  props.tasks.forEach((task) => {
    if (task.completedAt) {
      activities.push({
        id: `task-${task.id}`,
        type: "task",
        action: "Task completed",
        subject: task.title,
        timestamp: new Date(task.completedAt),
      })
    }
  })

  // Staff tasks completed
  props.staffTasks.forEach((task) => {
    if (task.completedAt) {
      activities.push({
        id: `stafftask-${task.id}`,
        type: "staffTask",
        action: "Task completed",
        subject: task.title,
        timestamp: new Date(task.completedAt),
      })
    }
  })

  // Events created
  props.events.forEach((event) => {
    activities.push({
      id: `event-${event.id}`,
      type: "event",
      action: "Event created",
      subject: event.title,
      timestamp: new Date(event.createdAt),
    })
  })

  // Sort by timestamp descending and take first 10
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10)
}

// BREADCRUMB: Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const typeIcons: Record<ActivityItem["type"], React.ReactNode> = {
  horse: <Rabbit className="h-3 w-3" />,
  client: <Users className="h-3 w-3" />,
  invoice: <Receipt className="h-3 w-3" />,
  task: <CheckCircle className="h-3 w-3" />,
  event: <Calendar className="h-3 w-3" />,
  staffTask: <ClipboardList className="h-3 w-3" />,
}

const typeColors: Record<ActivityItem["type"], string> = {
  horse: "text-green-400",
  client: "text-blue-400",
  invoice: "text-yellow-400",
  task: "text-purple-400",
  event: "text-cyan-400",
  staffTask: "text-orange-400",
}

export function RecentActivityFeed(props: RecentActivityFeedProps) {
  const activities = buildActivityList(props)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="rounded-lg border border-[var(--border)] bg-[#1A1A2E]/50 p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-[#2C5F2E]" />
        <h3 className="text-sm font-medium text-white">Recent Activity</h3>
      </div>

      {activities.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
              className="flex items-start gap-3"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center bg-gray-800 flex-shrink-0 ${typeColors[activity.type]}`}
              >
                {typeIcons[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                  <span className="text-gray-400">{activity.action}:</span>{" "}
                  <span className="font-medium">{activity.subject}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
