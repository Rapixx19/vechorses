/**
 * FILE: modules/dashboard/components/TaskChecklist.tsx
 * ZONE: Green
 * PURPOSE: Interactive checklist of today's tasks
 * EXPORTS: TaskChecklist
 * DEPENDS ON: lib/types.ts, react
 * CONSUMED BY: app/dashboard/page.tsx
 * TESTS: modules/dashboard/tests/TaskChecklist.test.tsx
 * LAST CHANGED: 2026-03-06 — Polished with outlined badges, reduced padding
 */

"use client"

import { useState } from "react"
import type { Task, Horse } from "@/lib/types"

interface TaskChecklistProps {
  tasks: Task[]
  horses: Horse[]
}

// BREADCRUMB: Outlined badge colors for subtle appearance
const typeColors: Record<string, string> = {
  feeding: "border-amber-600/60 text-amber-500/80",
  medication: "border-blue-600/60 text-blue-400/80",
  farrier: "border-purple-600/60 text-purple-400/80",
  vet: "border-red-600/60 text-red-400/80",
  other: "border-gray-500/60 text-gray-400/80",
}

export function TaskChecklist({ tasks: initialTasks, horses }: TaskChecklistProps) {
  const [tasks, setTasks] = useState(initialTasks)

  const today = new Date().toISOString().split("T")[0]
  const todaysTasks = tasks.filter((task) => task.dueDate === today && !task.completedAt)

  const getHorseName = (horseId: string) =>
    horses.find((h) => h.id === horseId)?.name ?? "Unknown"

  const handleCheck = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completedAt: new Date().toISOString() } : task
      )
    )
  }

  if (todaysTasks.length === 0) {
    return (
      <div className="rounded-md px-4 py-3 border border-[var(--border)]">
        <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">Today&apos;s Tasks</h3>
        <p className="text-xs text-green-500/80">All caught up!</p>
      </div>
    )
  }

  return (
    <div className="rounded-md px-4 py-3 border border-[var(--border)]">
      <h3 className="text-xs font-medium text-[var(--text-muted)] mb-2">
        Today&apos;s Tasks ({todaysTasks.length})
      </h3>
      <ul className="space-y-1.5">
        {todaysTasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              onChange={() => handleCheck(task.id)}
              className="h-3 w-3 rounded border-gray-600 bg-transparent"
            />
            <span className="font-medium text-[var(--text-primary)]">
              {getHorseName(task.horseId)}
            </span>
            <span className="text-[var(--text-muted)] flex-1 truncate">{task.title}</span>
            <span className={`px-1.5 py-0.5 rounded border text-[10px] ${typeColors[task.type]}`}>
              {task.type}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
