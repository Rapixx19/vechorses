/**
 * FILE: modules/dashboard/components/HorsesGlance.tsx
 * ZONE: Green
 * PURPOSE: Quick overview of horses with stall and owner info
 * EXPORTS: HorsesGlance
 * DEPENDS ON: framer-motion, lucide-react, next/link
 * CONSUMED BY: DashboardPage
 * TESTS: modules/dashboard/tests/HorsesGlance.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for lively dashboard
 */

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Rabbit, AlertCircle } from "lucide-react"
import type { Horse, Client, Stall, Task } from "@/lib/types"

interface HorsesGlanceProps {
  horses: Horse[]
  clients: Client[]
  stalls: Stall[]
  tasks: Task[]
}

export function HorsesGlance({ horses, clients, stalls, tasks }: HorsesGlanceProps) {
  const activeHorses = horses.filter((h) => h.isActive).slice(0, 6)

  // BREADCRUMB: Check for overdue medical tasks per horse
  const today = new Date().toISOString().split("T")[0]
  const overdueTasksByHorse = new Map<string, number>()

  tasks.forEach((task) => {
    if (
      task.type === "medication" ||
      task.type === "vet" ||
      task.type === "farrier"
    ) {
      if (task.dueDate < today && !task.completedAt) {
        overdueTasksByHorse.set(
          task.horseId,
          (overdueTasksByHorse.get(task.horseId) || 0) + 1
        )
      }
    }
  })

  // Helper functions
  const getClientName = (ownerId: string) => {
    const client = clients.find((c) => c.id === ownerId)
    return client?.fullName || "Unknown"
  }

  const getStallLabel = (stallId: string | null) => {
    if (!stallId) return null
    const stall = stalls.find((s) => s.id === stallId)
    return stall?.label || null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-lg border border-[var(--border)] bg-[#1A1A2E]/50 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rabbit className="h-4 w-4 text-[#2C5F2E]" />
          <h3 className="text-sm font-medium text-white">Horses at a Glance</h3>
        </div>
        <Link href="/horses" className="text-xs text-gray-400 hover:text-white">
          View all
        </Link>
      </div>

      {activeHorses.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No horses yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {activeHorses.map((horse, i) => {
            const stallLabel = getStallLabel(horse.stallId)
            const ownerName = getClientName(horse.ownerId)
            const overdueCount = overdueTasksByHorse.get(horse.id) || 0

            return (
              <Link key={horse.id} href={`/horses/${horse.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 * i }}
                  className="p-3 rounded-lg bg-[#0F1117] border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer relative"
                >
                  {/* Overdue indicator */}
                  {overdueCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                      <AlertCircle className="h-3 w-3 text-white" />
                    </div>
                  )}

                  <p className="text-sm font-medium text-white truncate">
                    {horse.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {stallLabel ? `Stall ${stallLabel}` : "No stall"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {ownerName}
                  </p>
                </motion.div>
              </Link>
            )
          })}
        </div>
      )}

      {horses.length > 6 && (
        <Link
          href="/horses"
          className="block text-center text-xs text-gray-400 hover:text-white mt-3"
        >
          +{horses.length - 6} more horses
        </Link>
      )}
    </motion.div>
  )
}
