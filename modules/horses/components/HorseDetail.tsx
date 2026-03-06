/**
 * FILE: modules/horses/components/HorseDetail.tsx
 * ZONE: Green
 * PURPOSE: Full horse profile with tasks and notes
 * EXPORTS: HorseDetail
 * DEPENDS ON: useHorses, useTasks, useClients, useStalls
 * CONSUMED BY: app/horses/[id]/page.tsx
 * TESTS: modules/horses/tests/HorseDetail.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"
import { useHorses, useTasks } from "@/modules/horses"
import { useClients } from "@/modules/clients"
import { useStalls } from "@/modules/stalls"

interface HorseDetailProps {
  horseId: string
}

const typeColors: Record<string, string> = {
  feeding: "bg-amber-600",
  medication: "bg-blue-600",
  farrier: "bg-purple-600",
  vet: "bg-red-600",
  other: "bg-gray-600",
}

export function HorseDetail({ horseId }: HorseDetailProps) {
  const horses = useHorses()
  const clients = useClients()
  const stalls = useStalls()
  const tasks = useTasks(horseId)

  const horse = horses.find((h) => h.id === horseId)
  if (!horse) return <p className="text-red-400">Horse not found</p>

  const owner = clients.find((c) => c.id === horse.ownerId)
  const stall = stalls.find((s) => s.id === horse.stallId)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

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

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard label="Date of Birth" value={formatDate(horse.dateOfBirth)} />
        <InfoCard label="Stall" value={stall?.label ?? "No stall assigned"} />
        <InfoCard
          label="Owner"
          value={owner?.fullName ?? "Unknown"}
          href={owner ? `/clients/${owner.id}` : undefined}
        />
        <InfoCard label="Status" value={horse.isActive ? "Active" : "Inactive"} />
      </div>

      {/* Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NotesCard title="Feeding Notes" content={horse.feedingNotes} />
        <NotesCard title="Medical Notes" content={horse.medicalNotes} />
      </div>

      {/* Tasks */}
      <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">Tasks ({tasks.length})</h3>
        {tasks.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No tasks for this horse</p>
        ) : (
          <ul className="space-y-2">
            {tasks.slice(0, 10).map((task) => (
              <li key={task.id} className="flex items-center gap-3 text-sm">
                <span className={`text-xs px-2 py-0.5 rounded ${typeColors[task.type]}`}>{task.type}</span>
                <span className="text-[var(--text-primary)] flex-1">{task.title}</span>
                <span className="text-[var(--text-muted)]">{task.dueDate}</span>
                <span className={task.completedAt ? "text-green-500" : "text-amber-500"}>
                  {task.completedAt ? "Done" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function InfoCard({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      {href ? (
        <Link href={href} className="text-[#2C5F2E] hover:underline">{value}</Link>
      ) : (
        <p className="text-[var(--text-primary)]">{value}</p>
      )}
    </div>
  )
}

function NotesCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#1A1A2E" }}>
      <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">{title}</h4>
      <p className="text-sm text-[var(--text-muted)]">{content || "No notes"}</p>
    </div>
  )
}
