/**
 * FILE: modules/stalls/components/StallGrid.tsx
 * ZONE: Green
 * PURPOSE: Main stalls page with floor plan builder and mobile list view
 * EXPORTS: StallGrid
 * DEPENDS ON: useStalls, useHorses, useClients, useStableLayout, FloorPlanCanvas, etc.
 * CONSUMED BY: app/stalls/page.tsx
 * TESTS: modules/stalls/tests/StallGrid.test.tsx
 * LAST CHANGED: 2026-03-07 — UI overhaul with skeleton loading
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { Settings, Grid, List, Grid3X3 } from "lucide-react"
import { useStalls, useAddStall, useUpdateStall, useDeleteStall } from "@/modules/stalls"
import { useHorses } from "@/modules/horses"
import { useClients } from "@/modules/clients"
import { Skeleton } from "@/modules/dashboard"
import { useStableLayout } from "../hooks/useStableLayout"
import { FloorPlanCanvas } from "./FloorPlanCanvas"
import { FloorPlanView } from "./FloorPlanView"
import { MobileStallList } from "./MobileStallList"
import { StableStatsBar } from "./StableStatsBar"
import { StallSheet } from "./StallSheet"
import { AssignHorseSheet } from "./AssignHorseSheet"
import type { Stall, StableLayout } from "@/lib/types"

type SheetState = { type: "detail"; stall: Stall } | { type: "assign"; stall: Stall } | null
type ViewMode = "grid" | "list"

// BREADCRUMB: Mobile breakpoint detection
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

// BREADCRUMB: Skeleton loading state for StallGrid
function StallGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="card p-4 grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-8 w-12 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  )
}

export function StallGrid() {
  const { stalls, isLoading: stallsLoading, refetch } = useStalls()
  const { horses, isLoading: horsesLoading } = useHorses()
  const { clients, isLoading: clientsLoading } = useClients()
  const { layout: savedLayout, isLoading: layoutLoading, saveLayout, generateDefaultLayout } = useStableLayout()
  const { addStall } = useAddStall()
  const { updateStall, updateStallPositions } = useUpdateStall()
  useDeleteStall() // Available for future use

  const [isEditMode, setIsEditMode] = useState(false)
  const [localLayout, setLocalLayout] = useState<StableLayout | null>(null)
  const [sheetState, setSheetState] = useState<SheetState>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [isSaving, setIsSaving] = useState(false)

  const isMobile = useIsMobile()
  const isLoading = stallsLoading || horsesLoading || clientsLoading || layoutLoading

  // BREADCRUMB: Initialize layout from saved or generate default
  useEffect(() => {
    if (!isLoading && stalls.length >= 0) {
      if (savedLayout) {
        setLocalLayout(savedLayout)
      } else if (stalls.length > 0) {
        setLocalLayout(generateDefaultLayout(stalls))
      } else {
        setLocalLayout({ rows: 8, cols: 10, cells: [] })
      }
    }
  }, [isLoading, savedLayout, stalls, generateDefaultLayout])

  const getHorse = (horseId: string | null) => horses.find((h) => h.id === horseId) || null
  const getClient = (ownerId: string) => clients.find((c) => c.id === ownerId) || null
  const unassignedHorses = horses.filter((h) => !stalls.some((s) => s.horseId === h.id))

  // BREADCRUMB: Handle stall click in view mode
  const handleStallClick = useCallback((stallId: string) => {
    const stall = stalls.find((s) => s.id === stallId)
    if (!stall) return
    setSheetState(stall.horseId ? { type: "detail", stall } : { type: "assign", stall })
  }, [stalls])

  // BREADCRUMB: Handle stall click from mobile list
  const handleMobileStallClick = useCallback((stall: Stall) => {
    setSheetState(stall.horseId ? { type: "detail", stall } : { type: "assign", stall })
  }, [])

  // BREADCRUMB: Save layout and sync stall positions
  const handleSaveLayout = async () => {
    if (!localLayout) return

    setIsSaving(true)

    const layoutSaved = await saveLayout(localLayout)

    if (layoutSaved) {
      const stallCells = localLayout.cells.filter((c) => c.type === "stall" && c.stallId)
      const positionUpdates = stallCells.map((cell) => ({
        id: cell.stallId!,
        position: cell.row * localLayout.cols + cell.col,
        rowIndex: cell.row,
        colIndex: cell.col,
      }))

      if (positionUpdates.length > 0) {
        await updateStallPositions(positionUpdates)
      }

      const newStallCells = localLayout.cells.filter((c) => c.type === "stall" && !c.stallId)
      for (const cell of newStallCells) {
        const result = await addStall({
          label: cell.label || `Box ${stalls.length + 1}`,
          type: cell.stallType || "standard",
          position: cell.row * localLayout.cols + cell.col,
          rowIndex: cell.row,
          colIndex: cell.col,
        })
        if (result.success && result.id) {
          cell.stallId = result.id
        }
      }

      await saveLayout(localLayout)
      refetch()
    }

    setIsSaving(false)
    setIsEditMode(false)
  }

  // BREADCRUMB: Cancel edit mode
  const handleCancelEdit = () => {
    setLocalLayout(savedLayout || generateDefaultLayout(stalls))
    setIsEditMode(false)
  }

  // BREADCRUMB: Handle assign horse
  const handleAssign = async () => {
    if (sheetState?.type === "assign") {
      await updateStall(sheetState.stall.id, {})
      refetch()
      setSheetState(null)
    }
  }

  // BREADCRUMB: Handle unassign horse
  const handleUnassign = () => {
    if (sheetState?.type === "detail") {
      refetch()
      setSheetState(null)
    }
  }

  if (isLoading) {
    return <StallGridSkeleton />
  }

  // Mobile view
  if (isMobile && !isEditMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Stalls</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="btn btn-secondary"
            >
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <StableStatsBar stalls={stalls} />

        <MobileStallList stalls={stalls} horses={horses} onStallClick={handleMobileStallClick} />

        {/* Sheets */}
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

  // Empty state
  if (stalls.length === 0 && !localLayout?.cells.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Stalls</h2>
        </div>
        <div className="empty-state card">
          <Grid3X3 className="h-12 w-12 text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-primary)] font-medium mb-2">No stalls configured</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">Set up your stable layout to manage stall assignments</p>
          <button onClick={() => setIsEditMode(true)} className="btn btn-primary">
            <Settings className="h-4 w-4" />
            Configure Layout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Stalls</h2>
        {!isEditMode && (
          <button onClick={() => setIsEditMode(true)} className="btn btn-secondary">
            <Settings className="h-4 w-4" />
            Edit Layout
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <StableStatsBar stalls={stalls} />

      {/* Edit Mode: Floor Plan Canvas */}
      {isEditMode && localLayout ? (
        <FloorPlanCanvas
          layout={localLayout}
          stalls={stalls}
          horses={horses}
          onLayoutChange={setLocalLayout}
          onSave={handleSaveLayout}
          onCancel={handleCancelEdit}
          onStallClick={handleStallClick}
          isSaving={isSaving}
        />
      ) : (
        /* View Mode: Floor Plan View */
        localLayout && (
          <FloorPlanView
            layout={localLayout}
            stalls={stalls}
            horses={horses}
            onStallClick={handleStallClick}
          />
        )
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
