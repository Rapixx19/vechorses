/**
 * FILE: modules/dashboard/components/OverdueTasks.tsx
 * ZONE: Green
 * PURPOSE: Display overdue tasks with warning styling
 * EXPORTS: OverdueTasks
 * DEPENDS ON: lib/types.ts, modules/horses
 * CONSUMED BY: app/dashboard/page.tsx
 * TESTS: modules/dashboard/tests/OverdueTasks.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

import type { Task, Horse } from "@/lib/types"

interface OverdueTasksProps {
  tasks: Task[]
  horses: Horse[]
}

export function OverdueTasks({ tasks, horses }: OverdueTasksProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overdueTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today && !task.completedAt
  })

  const getHorseName = (horseId: string) =>
    horses.find((h) => h.id === horseId)?.name ?? "Unknown"

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (overdueTasks.length === 0) {
    return (
      <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">Overdue Tasks</h3>
        <p className="text-sm text-green-500">No overdue tasks!</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg p-4 border border-red-900/50" style={{ backgroundColor: "#1A1A2E" }}>
      <h3 className="font-semibold text-red-400 mb-3">⚠️ Overdue Tasks ({overdueTasks.length})</h3>
      <ul className="space-y-2">
        {overdueTasks.map((task) => (
          <li key={task.id} className="text-sm">
            <span className="text-[var(--text-primary)]">{getHorseName(task.horseId)}</span>
            <span className="text-[var(--text-muted)]"> — {task.title}</span>
            <span className="text-red-400 ml-2">({getDaysOverdue(task.dueDate)}d overdue)</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
