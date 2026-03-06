/**
 * FILE: modules/stalls/components/StallGrid.tsx
 * ZONE: Green
 * PURPOSE: Visual grid of stalls grouped by block with task counts
 * EXPORTS: StallGrid
 * DEPENDS ON: useStalls, useHorses, useClients, useTasks, StallCell, StallSheet, AssignHorseSheet
 * CONSUMED BY: app/stalls/page.tsx
 * TESTS: modules/stalls/tests/StallGrid.test.tsx
 * LAST CHANGED: 2026-03-06 — Added task counting and StallSheet
 */

"use client"

import { useState } from "react"
import { useStalls } from "@/modules/stalls"
import { useHorses, useTasks } from "@/modules/horses"
import { useClients } from "@/modules/clients"
import { StallCell } from "./StallCell"
import { StallSheet } from "./StallSheet"
import { AssignHorseSheet } from "./AssignHorseSheet"
import type { Stall } from "@/lib/types"

type SheetState = { type: "sheet"; stall: Stall } | { type: "assign"; stall: Stall } | null

export function StallGrid() {
  const { stalls, isLoading: stallsLoading } = useStalls()
  const { horses, isLoading: horsesLoading } = useHorses()
  const { clients, isLoading: clientsLoading } = useClients()
  const { tasks: allTasks, isLoading: tasksLoading } = useTasks()
  const [localStalls, setLocalStalls] = useState(stalls)

  const isLoading = stallsLoading || horsesLoading || clientsLoading || tasksLoading
  const [sheetState, setSheetState] = useState<SheetState>(null)

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C5F2E]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
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
    </div>
  )
}
