/**
 * FILE: modules/stalls/components/StallSheet.tsx
 * ZONE: Green
 * PURPOSE: Sheet showing stall details, horse info, and pending tasks
 * EXPORTS: StallSheet
 * DEPENDS ON: lib/types.ts, next/link, lucide-react
 * CONSUMED BY: StallGrid
 * TESTS: modules/stalls/tests/StallSheet.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation with tasks section
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { X, Plus, Check } from "lucide-react"
import type { Stall, Horse, Client, Task, TaskType } from "@/lib/types"

interface StallSheetProps {
  stall: Stall
  horse: Horse
  owner: Client | null
  tasks: Task[]
  onClose: () => void
  onUnassign: () => void
  onCompleteTask: (taskId: string) => void
}

const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
const getAge = (dob: string) => Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))

const typeColors: Record<TaskType, string> = {
  feeding: "border-blue-600/40 text-blue-400",
  medication: "border-red-600/40 text-red-400",
  farrier: "border-amber-600/40 text-amber-400",
  vet: "border-purple-600/40 text-purple-400",
  other: "border-gray-500/40 text-gray-400",
}

export function StallSheet({ stall, horse, owner, tasks, onClose, onUnassign, onCompleteTask }: StallSheetProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const pendingTasks = tasks.filter((t) => !t.completedAt && !completedIds.has(t.id))

  const handleComplete = (taskId: string) => {
    setCompletedIds((prev) => new Set(prev).add(taskId))
    onCompleteTask(taskId)
  }

  const handleAddInstruction = () => alert("Worker instructions coming in V2")
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-80 h-full bg-[#0F1117] border-l border-[var(--border)] p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <X className="h-5 w-5" />
        </button>

        <p className="text-xs text-[var(--text-muted)] mb-4">{stall.label}</p>

        {/* Horse Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: "#2C5F2E" }}>
            {getInitials(horse.name)}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-[var(--text-primary)]">{horse.name}</h3>
            <p className="text-sm text-[var(--text-muted)]">{horse.breed}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between"><span className="text-[var(--text-muted)]">Color</span><span className="text-[var(--text-primary)]">{horse.color}</span></div>
          <div className="flex justify-between"><span className="text-[var(--text-muted)]">Age</span><span className="text-[var(--text-primary)]">{getAge(horse.dateOfBirth)} years</span></div>
          {owner && <div className="flex justify-between"><span className="text-[var(--text-muted)]">Owner</span><span className="text-[var(--text-primary)]">{owner.fullName}</span></div>}
        </div>

        <div className="flex gap-2 mb-6">
          <Link href={`/horses/${horse.id}`} className="flex-1 px-3 py-2 rounded-md text-xs font-medium text-center bg-[#1A1A2E] text-[var(--text-primary)] hover:bg-[#252538]">View Horse</Link>
          {owner && <Link href={`/clients/${owner.id}`} className="flex-1 px-3 py-2 rounded-md text-xs font-medium text-center bg-[#1A1A2E] text-[var(--text-primary)] hover:bg-[#252538]">View Owner</Link>}
        </div>

        {/* Stall Instructions */}
        <div className="border-t border-[var(--border)] pt-4 mb-4">
          <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Stall Instructions</h4>
          {pendingTasks.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-4 text-center">No instructions for this stall</p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2 p-2 rounded bg-[#1A1A2E]">
                  <button onClick={() => handleComplete(task.id)} className="mt-0.5 w-4 h-4 rounded border border-[var(--border)] hover:border-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-transparent hover:text-green-500" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-primary)] truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded border text-[9px] ${typeColors[task.type]}`}>{task.type}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-[var(--text-muted)] mt-2 italic">Full task management in V2</p>
        </div>

        <button onClick={handleAddInstruction} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[#1A1A2E] text-[var(--text-primary)] hover:bg-[#252538] mb-4">
          <Plus className="h-4 w-4" />Add Instruction
        </button>

        <button onClick={onUnassign} className="w-full px-4 py-2 rounded-md text-sm font-medium text-red-400 border border-red-400/30 hover:bg-red-400/10">
          Unassign Horse
        </button>
      </div>
    </div>
  )
}
