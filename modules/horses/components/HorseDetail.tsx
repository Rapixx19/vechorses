/**
 * FILE: modules/horses/components/HorseDetail.tsx
 * ZONE: Green
 * PURPOSE: Full horse profile with tabbed interface
 * EXPORTS: HorseDetail
 * DEPENDS ON: useHorses, useTasks, useClients, useStalls, HorseOverviewTab, HorsePhotos, DocumentList, DocumentUpload
 * CONSUMED BY: app/horses/[id]/page.tsx
 * TESTS: modules/horses/tests/HorseDetail.test.tsx
 * LAST CHANGED: 2026-03-06 — Added tabs for Overview, Photos, Documents
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Pencil } from "lucide-react"
import { useHorses, useTasks } from "@/modules/horses"
import { useClients } from "@/modules/clients"
import { useStalls } from "@/modules/stalls"
import { HorseOverviewTab } from "./HorseOverviewTab"
import { HorsePhotos } from "./HorsePhotos"
import { DocumentList } from "./DocumentList"
import { DocumentUpload } from "./DocumentUpload"

interface HorseDetailProps {
  horseId: string
}

type Tab = "overview" | "photos" | "documents"

export function HorseDetail({ horseId }: HorseDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const { horses, isLoading: horsesLoading } = useHorses()
  const { clients, isLoading: clientsLoading } = useClients()
  const { stalls, isLoading: stallsLoading } = useStalls()
  const { tasks, isLoading: tasksLoading } = useTasks(horseId)

  const isLoading = horsesLoading || clientsLoading || stallsLoading || tasksLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C5F2E]" />
      </div>
    )
  }

  const horse = horses.find((h) => h.id === horseId)
  if (!horse) return <p className="text-red-400">Horse not found</p>

  const owner = clients.find((c) => c.id === horse.ownerId)
  const stall = stalls.find((s) => s.id === horse.stallId)

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "photos", label: "Photos" },
    { id: "documents", label: "Documents" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">{horse.name}</h2>
          <p className="text-[var(--text-muted)]">{horse.breed} · {horse.color}</p>
        </div>
        <Link
          href={`/horses/${horseId}/edit`}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[#1A1A2E] text-[var(--text-primary)] hover:bg-[#252538]"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#2C5F2E] text-[#2C5F2E]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <HorseOverviewTab horse={horse} owner={owner} stall={stall} tasks={tasks} />
      )}

      {activeTab === "photos" && (
        <HorsePhotos horseId={horseId} horseName={horse.name} />
      )}

      {activeTab === "documents" && (
        <div className="space-y-4">
          <DocumentUpload />
          <DocumentList horseId={horseId} />
        </div>
      )}
    </div>
  )
}
