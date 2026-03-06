/**
 * FILE: modules/dashboard/components/OverdueTasks.tsx
 * ZONE: Green
 * PURPOSE: Display overdue tasks with soft warning styling
 * EXPORTS: OverdueTasks
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: app/dashboard/page.tsx
 * TESTS: modules/dashboard/tests/OverdueTasks.test.tsx
 * LAST CHANGED: 2026-03-06 — Softened red, only days overdue stays red
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
      <div className="rounded-md px-4 py-3 border border-[var(--border)]">
        <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">Overdue</h3>
        <p className="text-xs text-green-500/80">No overdue tasks</p>
      </div>
    )
  }

  return (
    <div className="rounded-md px-4 py-3 border border-red-900/30">
      <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">
        Overdue ({overdueTasks.length})
      </h3>
      <ul className="space-y-1.5">
        {overdueTasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2 text-xs">
            <span className="font-medium text-[var(--text-primary)]">
              {getHorseName(task.horseId)}
            </span>
            <span className="text-[var(--text-muted)] flex-1 truncate">{task.title}</span>
            <span className="text-red-400/80 text-[10px]">
              {getDaysOverdue(task.dueDate)}d overdue
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
