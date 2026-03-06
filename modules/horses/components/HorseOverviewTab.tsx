/**
 * FILE: modules/horses/components/HorseOverviewTab.tsx
 * ZONE: Green
 * PURPOSE: Overview tab content with avatar and stats for horse detail
 * EXPORTS: HorseOverviewTab
 * DEPENDS ON: lib/types.ts, next/link
 * CONSUMED BY: HorseDetail
 * TESTS: modules/horses/tests/HorseOverviewTab.test.tsx
 * LAST CHANGED: 2026-03-06 — Added profile avatar, stats row, improved layout
 */

import Link from "next/link"
import type { Horse, Task, Client, Stall } from "@/lib/types"

interface HorseOverviewTabProps {
  horse: Horse
  owner: Client | undefined
  stall: Stall | undefined
  tasks: Task[]
}

// BREADCRUMB: Breed colors for avatar background when no photo
const breedColors: Record<string, string> = {
  Thoroughbred: "#DC2626", Arabian: "#D97706", Warmblood: "#2563EB", Friesian: "#374151",
  Andalusian: "#7C3AED", Hanoverian: "#059669", "Irish Sport Horse": "#0891B2", Lusitano: "#DB2777",
}

const typeColors: Record<string, string> = {
  feeding: "bg-amber-600", medication: "bg-blue-600", farrier: "bg-purple-600", vet: "bg-red-600", other: "bg-gray-600",
}

const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

const getAge = (dob: string) => {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--
  return age
}

export function HorseOverviewTab({ horse, owner, stall, tasks }: HorseOverviewTabProps) {
  const photo = horse.photoUrls?.[0]
  const breedColor = breedColors[horse.breed] ?? "#6B7280"

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-5">
        {photo ? (
          <img src={photo} alt={horse.name} className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: breedColor }}>
            {getInitials(horse.name)}
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">{horse.name}</h3>
          {owner && (
            <Link href={`/clients/${owner.id}`} className="text-sm text-[#2C5F2E] hover:underline">
              Owner: {owner.fullName}
            </Link>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-6 px-4 py-3 rounded-lg" style={{ backgroundColor: "#1A1A2E" }}>
        <Stat label="Age" value={`${getAge(horse.dateOfBirth)} years`} />
        <Stat label="Breed" value={horse.breed} />
        <Stat label="Color" value={horse.color} />
        <Stat label="Stall" value={stall?.label ?? "None"} />
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="text-sm font-medium text-[var(--text-primary)]">{value}</p>
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
