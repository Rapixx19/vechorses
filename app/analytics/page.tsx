/**
 * FILE: app/analytics/page.tsx
 * ZONE: Green
 * PURPOSE: Analytics dashboard with occupancy, revenue, and task metrics
 * EXPORTS: default (AnalyticsPage)
 * DEPENDS ON: react, lucide-react
 * CONSUMED BY: Next.js routing
 * TESTS: None
 * LAST CHANGED: 2026-03-14 — Initial creation
 */

"use client"

import { useState } from "react"
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

type TimeRange = "7d" | "30d" | "90d" | "1y"

interface MetricCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  trend: "up" | "down" | "neutral"
}

function MetricCard({ title, value, change, icon, trend }: MetricCardProps) {
  return (
    <div className="p-5 rounded-xl bg-[#1A1A2E] border border-[var(--border)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[var(--text-muted)]">{title}</span>
        <div className="p-2 rounded-lg bg-[#252538]">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-[var(--text-primary)]">{value}</span>
        <div
          className={`flex items-center gap-1 text-sm ${
            trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-gray-400"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : trend === "down" ? (
            <ArrowDownRight className="h-4 w-4" />
          ) : null}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  // Mock data - will be replaced with real Supabase queries in V2
  const metrics = {
    occupancy: { value: "87%", change: 5, trend: "up" as const },
    revenue: { value: "CHF 24,500", change: 12, trend: "up" as const },
    activeClients: { value: "23", change: 2, trend: "up" as const },
    tasksCompleted: { value: "156", change: -3, trend: "down" as const },
  }

  const revenueByCategory = [
    { category: "Boarding", amount: 15200, percentage: 62 },
    { category: "Lessons", amount: 5800, percentage: 24 },
    { category: "Veterinary", amount: 2100, percentage: 9 },
    { category: "Other", amount: 1400, percentage: 5 },
  ]

  const monthlyRevenue = [
    { month: "Jan", amount: 22000 },
    { month: "Feb", amount: 21500 },
    { month: "Mar", amount: 24500 },
    { month: "Apr", amount: 23800 },
    { month: "May", amount: 25200 },
    { month: "Jun", amount: 26100 },
  ]

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.amount))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Track your stable&apos;s performance</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-1 p-1 rounded-lg bg-[#1A1A2E]">
          {(["7d", "30d", "90d", "1y"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? "bg-[#2C5F2E] text-white"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "1 Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Stall Occupancy"
          value={metrics.occupancy.value}
          change={metrics.occupancy.change}
          trend={metrics.occupancy.trend}
          icon={<Activity className="h-5 w-5 text-[#2C5F2E]" />}
        />
        <MetricCard
          title="Total Revenue"
          value={metrics.revenue.value}
          change={metrics.revenue.change}
          trend={metrics.revenue.trend}
          icon={<DollarSign className="h-5 w-5 text-[#2C5F2E]" />}
        />
        <MetricCard
          title="Active Clients"
          value={metrics.activeClients.value}
          change={metrics.activeClients.change}
          trend={metrics.activeClients.trend}
          icon={<Users className="h-5 w-5 text-[#2C5F2E]" />}
        />
        <MetricCard
          title="Tasks Completed"
          value={metrics.tasksCompleted.value}
          change={metrics.tasksCompleted.change}
          trend={metrics.tasksCompleted.trend}
          icon={<Calendar className="h-5 w-5 text-[#2C5F2E]" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="p-6 rounded-xl bg-[#1A1A2E] border border-[var(--border)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#2C5F2E]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Revenue Trend</h3>
            </div>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-48">
            {monthlyRevenue.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-[#2C5F2E] rounded-t-md transition-all hover:bg-green-500"
                  style={{ height: `${(month.amount / maxRevenue) * 100}%` }}
                />
                <span className="text-xs text-[var(--text-muted)]">{month.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="p-6 rounded-xl bg-[#1A1A2E] border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="h-5 w-5 text-[#2C5F2E]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Revenue by Category</h3>
          </div>

          <div className="space-y-4">
            {revenueByCategory.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-primary)]">{item.category}</span>
                  <span className="text-sm text-[var(--text-muted)]">
                    CHF {item.amount.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-[#252538] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2C5F2E] rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 rounded-xl bg-[#1A1A2E] border border-[var(--border)]">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">18</p>
            <p className="text-sm text-[var(--text-muted)]">Total Horses</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">20</p>
            <p className="text-sm text-[var(--text-muted)]">Total Stalls</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">6</p>
            <p className="text-sm text-[var(--text-muted)]">Staff Members</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">4</p>
            <p className="text-sm text-[var(--text-muted)]">Pending Invoices</p>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30 text-center">
        <p className="text-sm text-blue-400">
          Full analytics with real-time data coming in V2. Current data is for demonstration.
        </p>
      </div>
    </div>
  )
}
