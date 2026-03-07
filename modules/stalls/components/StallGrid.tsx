/**
 * FILE: modules/stalls/components/StallGrid.tsx
 * ZONE: Green
 * PURPOSE: Visual stall grid with builder mode for arranging stalls
 * EXPORTS: StallGrid
 * DEPENDS ON: useStalls, useHorses, useClients, StallCard, StableStatsBar, StableBuilder
 * CONSUMED BY: app/stalls/page.tsx
 * TESTS: modules/stalls/tests/StallGrid.test.tsx
 * LAST CHANGED: 2026-03-07 — Complete rewrite for visual stable builder
 */

"use client"

import { useState, useEffect } from "react"
import { Settings, Loader2 } from "lucide-react"
import { useStalls, useAddStall, useUpdateStall, useDeleteStall } from "@/modules/stalls"
import { useHorses } from "@/modules/horses"
import { useClients } from "@/modules/clients"
import { StallCard } from "./StallCard"
import { StableStatsBar } from "./StableStatsBar"
import { StableBuilder } from "./StableBuilder"
import { StallSheet } from "./StallSheet"
import { AssignHorseSheet } from "./AssignHorseSheet"
import type { Stall } from "@/lib/types"

type SheetState = { type: "detail"; stall: Stall } | { type: "assign"; stall: Stall } | null

export function StallGrid() {
  const { stalls, isLoading: stallsLoading, refetch } = useStalls()
  const { horses, isLoading: horsesLoading } = useHorses()
  const { clients, isLoading: clientsLoading } = useClients()
  const { addStall } = useAddStall()
  const { updateStall, updateStallPositions } = useUpdateStall()
  const { deleteStall } = useDeleteStall()

  const [localStalls, setLocalStalls] = useState<Stall[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [gridCols, setGridCols] = useState(4)
  const [sheetState, setSheetState] = useState<SheetState>(null)

  const isLoading = stallsLoading || horsesLoading || clientsLoading

  // Sync local stalls with fetched stalls
  useEffect(() => {
    setLocalStalls(stalls)
    if (stalls.length > 0) {
      setGridCols(stalls[0].gridCols || 4)
    }
  }, [stalls])

  const getHorse = (horseId: string | null) => horses.find((h) => h.id === horseId) || null
  const getClient = (ownerId: string) => clients.find((c) => c.id === ownerId) || null
  const unassignedHorses = horses.filter((h) => !localStalls.some((s) => s.horseId === h.id))

  // BREADCRUMB: Handle stall card click - show detail or assign sheet
  const handleStallClick = (stall: Stall) => {
    if (isEditMode) return
    setSheetState(stall.horseId ? { type: "detail", stall } : { type: "assign", stall })
  }

  // BREADCRUMB: Handle adding new stall in builder mode
  const handleAddStall = async (position: number, rowIndex: number, colIndex: number) => {
    const label = `Box ${localStalls.length + 1}`
    const result = await addStall({ label, position, rowIndex, colIndex })
    if (result.success) {
      refetch()
    }
  }

  // BREADCRUMB: Handle updating stall in builder mode
  const handleUpdateStall = (id: string, updates: Partial<Stall>) => {
    setLocalStalls((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  // BREADCRUMB: Handle deleting stall in builder mode
  const handleDeleteStall = async (id: string) => {
    if (!confirm("Delete this stall?")) return
    setLocalStalls((prev) => prev.filter((s) => s.id !== id))
    await deleteStall(id)
  }

  // BREADCRUMB: Save all layout changes
  const handleSaveLayout = async () => {
    // Update grid cols for all stalls
    const updates = localStalls.map((stall) => ({
      id: stall.id,
      position: stall.position,
      rowIndex: stall.rowIndex,
      colIndex: stall.colIndex,
    }))

    await updateStallPositions(updates)

    // Update grid cols individually
    for (const stall of localStalls) {
      await updateStall(stall.id, { gridCols, type: stall.type, isMaintenance: stall.isMaintenance, label: stall.label })
    }

    setIsEditMode(false)
    refetch()
  }

  // BREADCRUMB: Cancel edit mode and revert changes
  const handleCancelEdit = () => {
    setLocalStalls(stalls)
    setIsEditMode(false)
  }

  // BREADCRUMB: Handle assigning horse to stall
  const handleAssign = async (horseId: string) => {
    if (sheetState?.type === "assign") {
      // TODO: Update horse's stallId in horses table
      setLocalStalls((prev) =>
        prev.map((s) => (s.id === sheetState.stall.id ? { ...s, horseId } : s))
      )
      setSheetState(null)
    }
  }

  // BREADCRUMB: Handle unassigning horse from stall
  const handleUnassign = () => {
    if (sheetState?.type === "detail") {
      // TODO: Update horse's stallId to null in horses table
      setLocalStalls((prev) =>
        prev.map((s) => (s.id === sheetState.stall.id ? { ...s, horseId: null } : s))
      )
      setSheetState(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2C5F2E]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Stalls</h2>
        {!isEditMode && (
          <button
            onClick={() => setIsEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[#1A1A2E] text-[var(--text-primary)] hover:bg-[#252538]"
          >
            <Settings className="h-4 w-4" />
            Edit Layout
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <StableStatsBar stalls={localStalls} />

      {/* Edit Mode: Builder */}
      {isEditMode ? (
        <StableBuilder
          stalls={localStalls}
          gridCols={gridCols}
          onGridColsChange={setGridCols}
          onAddStall={handleAddStall}
          onUpdateStall={handleUpdateStall}
          onDeleteStall={handleDeleteStall}
          onSave={handleSaveLayout}
          onCancel={handleCancelEdit}
        />
      ) : (
        /* Normal Mode: Visual Grid */
        <>
          {localStalls.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--text-muted)] mb-2">No stalls yet</p>
              <button
                onClick={() => setIsEditMode(true)}
                className="text-sm text-[#2C5F2E] hover:underline"
              >
                Click "Edit Layout" to add stalls
              </button>
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
              }}
            >
              {localStalls
                .sort((a, b) => a.position - b.position)
                .map((stall) => (
                  <StallCard
                    key={stall.id}
                    stall={stall}
                    horse={getHorse(stall.horseId)}
                    onClick={() => handleStallClick(stall)}
                  />
                ))}
            </div>
          )}
        </>
      )}

      {/* Detail Sheet */}
      {sheetState?.type === "detail" && getHorse(sheetState.stall.horseId) && (
        <StallSheet
          stall={sheetState.stall}
          horse={getHorse(sheetState.stall.horseId)!}
          owner={getClient(getHorse(sheetState.stall.horseId)!.ownerId)}
          tasks={[]}
          onClose={() => setSheetState(null)}
          onUnassign={handleUnassign}
          onCompleteTask={() => {}}
        />
      )}

      {/* Assign Horse Sheet */}
      {sheetState?.type === "assign" && (
        <AssignHorseSheet
          stall={sheetState.stall}
          unassignedHorses={unassignedHorses}
          clients={clients}
          onAssign={handleAssign}
          onClose={() => setSheetState(null)}
        />
      )}
    </div>
  )
}
