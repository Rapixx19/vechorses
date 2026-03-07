/**
 * FILE: modules/stalls/components/StallGrid.tsx
 * ZONE: Green
 * PURPOSE: Visual grid of stalls grouped by block with task counts and add stall form
 * EXPORTS: StallGrid
 * DEPENDS ON: useStalls, useAddStall, useHorses, useClients, useTasks, StallCell, StallSheet, AssignHorseSheet
 * CONSUMED BY: app/stalls/page.tsx
 * TESTS: modules/stalls/tests/StallGrid.test.tsx
 * LAST CHANGED: 2026-03-07 — Added Add Stall button and form
 */

"use client"

import { useState, useEffect } from "react"
import { Plus, X } from "lucide-react"
import { useStalls, useAddStall } from "@/modules/stalls"
import { useHorses, useTasks } from "@/modules/horses"
import { useClients } from "@/modules/clients"
import { StallCell } from "./StallCell"
import { StallSheet } from "./StallSheet"
import { AssignHorseSheet } from "./AssignHorseSheet"
import type { Stall, StallType } from "@/lib/types"

type SheetState = { type: "sheet"; stall: Stall } | { type: "assign"; stall: Stall } | { type: "add" } | null

const STALL_TYPES: { value: StallType; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "large", label: "Large" },
  { value: "paddock", label: "Paddock" },
]

export function StallGrid() {
  const { stalls, isLoading: stallsLoading, refetch } = useStalls()
  const { horses, isLoading: horsesLoading } = useHorses()
  const { clients, isLoading: clientsLoading } = useClients()
  const { tasks: allTasks, isLoading: tasksLoading } = useTasks()
  const { addStall } = useAddStall()
  const [localStalls, setLocalStalls] = useState(stalls)
  const [newStallLabel, setNewStallLabel] = useState("")
  const [newStallType, setNewStallType] = useState<StallType>("standard")
  const [newStallNotes, setNewStallNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const isLoading = stallsLoading || horsesLoading || clientsLoading || tasksLoading
  const [sheetState, setSheetState] = useState<SheetState>(null)

  // Sync localStalls with stalls from hook
  useEffect(() => {
    setLocalStalls(stalls)
  }, [stalls])

  // BREADCRUMB: Group stalls by block letter extracted from label
  const blocks = localStalls.reduce<Record<string, typeof localStalls>>((acc, stall) => {
    const block = stall.label.split(" - ")[0] || "Other"
    if (!acc[block]) acc[block] = []
    acc[block].push(stall)
    return acc
  }, {})

  const getHorse = (horseId: string | null) => horses.find((h) => h.id === horseId) || null
  const getClient = (ownerId: string) => clients.find((c) => c.id === ownerId) || null
  const getTasksForHorse = (horseId: string) => allTasks.filter((t) => t.horseId === horseId)
  const getPendingCount = (horseId: string | null) => horseId ? allTasks.filter((t) => t.horseId === horseId && !t.completedAt).length : 0
  const unassignedHorses = horses.filter((h) => !localStalls.some((s) => s.horseId === h.id))

  const handleCellClick = (stall: Stall) => {
    setSheetState(stall.horseId ? { type: "sheet", stall } : { type: "assign", stall })
  }

  const handleUnassign = () => {
    if (sheetState?.type === "sheet") {
      setLocalStalls((prev) => prev.map((s) => s.id === sheetState.stall.id ? { ...s, horseId: null } : s))
      alert("Horse unassigned successfully")
      setSheetState(null)
    }
  }

  const handleAssign = (horseId: string) => {
    if (sheetState?.type === "assign") {
      setLocalStalls((prev) => prev.map((s) => s.id === sheetState.stall.id ? { ...s, horseId } : s))
      alert("Horse assigned successfully")
      setSheetState(null)
    }
  }

  const handleCompleteTask = (taskId: string) => {
    // BREADCRUMB: V1 mock — just log. Real completion in V2.
    console.log("Task completed:", taskId)
  }

  const handleAddStall = async () => {
    if (!newStallLabel.trim()) {
      setFormError("Label is required")
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    const result = await addStall({
      label: newStallLabel.trim(),
      type: newStallType,
      notes: newStallNotes.trim() || undefined,
    })

    if (result.success) {
      setNewStallLabel("")
      setNewStallType("standard")
      setNewStallNotes("")
      setSheetState(null)
      refetch()
    } else {
      setFormError(result.error || "Failed to add stall")
    }

    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C5F2E]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Add Stall Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setSheetState({ type: "add" })}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white"
          style={{ backgroundColor: "#2C5F2E" }}
        >
          <Plus className="h-4 w-4" />
          Add Stall
        </button>
      </div>

      {Object.entries(blocks).map(([blockName, blockStalls]) => {
        const occupied = blockStalls.filter((s) => s.horseId).length
        return (
          <div key={blockName}>
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">
              {blockName} — {occupied}/{blockStalls.length} occupied
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {blockStalls.map((stall) => {
                const horse = getHorse(stall.horseId)
                const owner = horse ? getClient(horse.ownerId) : null
                return (
                  <StallCell key={stall.id} stall={stall} horse={horse} pendingTaskCount={getPendingCount(stall.horseId)} ownerName={owner?.fullName} onClick={() => handleCellClick(stall)} />
                )
              })}
            </div>
          </div>
        )
      })}

      {sheetState?.type === "sheet" && getHorse(sheetState.stall.horseId) && (
        <StallSheet
          stall={sheetState.stall}
          horse={getHorse(sheetState.stall.horseId)!}
          owner={getClient(getHorse(sheetState.stall.horseId)!.ownerId)}
          tasks={getTasksForHorse(sheetState.stall.horseId!)}
          onClose={() => setSheetState(null)}
          onUnassign={handleUnassign}
          onCompleteTask={handleCompleteTask}
        />
      )}

      {sheetState?.type === "assign" && (
        <AssignHorseSheet stall={sheetState.stall} unassignedHorses={unassignedHorses} clients={clients} onAssign={handleAssign} onClose={() => setSheetState(null)} />
      )}

      {/* Add Stall Sheet */}
      {sheetState?.type === "add" && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSheetState(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-80 h-full bg-[#0F1117] border-l border-[var(--border)] p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSheetState(null)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-6">Add New Stall</h3>

            {formError && (
              <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Label *</label>
                <input
                  type="text"
                  value={newStallLabel}
                  onChange={(e) => setNewStallLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#1A1A2E] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
                  placeholder="e.g. Stall 1, Box A"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Type</label>
                <select
                  value={newStallType}
                  onChange={(e) => setNewStallType(e.target.value as StallType)}
                  className="w-full px-3 py-2 rounded-md bg-[#1A1A2E] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
                >
                  {STALL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Notes</label>
                <textarea
                  value={newStallNotes}
                  onChange={(e) => setNewStallNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md bg-[#1A1A2E] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#2C5F2E]"
                  placeholder="Optional notes..."
                />
              </div>

              <button
                onClick={handleAddStall}
                disabled={isSubmitting}
                className="w-full px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: "#2C5F2E" }}
              >
                {isSubmitting ? "Adding..." : "Add Stall"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
