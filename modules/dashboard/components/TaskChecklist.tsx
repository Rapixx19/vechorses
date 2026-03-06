/**
 * FILE: modules/dashboard/components/TaskChecklist.tsx
 * ZONE: Green
 * PURPOSE: Interactive checklist of today's tasks
 * EXPORTS: TaskChecklist
 * DEPENDS ON: lib/types.ts, react
 * CONSUMED BY: app/dashboard/page.tsx
 * TESTS: modules/dashboard/tests/TaskChecklist.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

"use client"

import { useState } from "react"
import type { Task, Horse } from "@/lib/types"

interface TaskChecklistProps {
  tasks: Task[]
  horses: Horse[]
}

const typeColors: Record<string, string> = {
  feeding: "bg-amber-600",
  medication: "bg-blue-600",
  farrier: "bg-purple-600",
  vet: "bg-red-600",
  other: "bg-gray-600",
}

export function TaskChecklist({ tasks: initialTasks, horses }: TaskChecklistProps) {
  const [tasks, setTasks] = useState(initialTasks)

  const today = new Date().toISOString().split("T")[0]
  const todaysTasks = tasks.filter(
    (task) => task.dueDate === today && !task.completedAt
  )

  const getHorseName = (horseId: string) =>
    horses.find((h) => h.id === horseId)?.name ?? "Unknown"

  const handleCheck = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, completedAt: new Date().toISOString() }
          : task
      )
    )
  }

  if (todaysTasks.length === 0) {
    return (
      <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">Today&apos;s Tasks</h3>
        <p className="text-sm text-green-500">All caught up!</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
      <h3 className="font-semibold text-[var(--text-primary)] mb-3">
        Today&apos;s Tasks ({todaysTasks.length})
      </h3>
      <ul className="space-y-2">
        {todaysTasks.map((task) => (
          <li key={task.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              onChange={() => handleCheck(task.id)}
              className="h-4 w-4 rounded border-gray-600 bg-transparent"
            />
            <span className="text-sm text-[var(--text-primary)]">
              {getHorseName(task.horseId)}
            </span>
            <span className="text-sm text-[var(--text-muted)] flex-1 truncate">
              {task.title}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${typeColors[task.type]}`}
            >
              {task.type}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
