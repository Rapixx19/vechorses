/**
 * FILE: modules/horses/components/HorsePhotos.tsx
 * ZONE: Green
 * PURPOSE: Display horse photos with hero image and thumbnails
 * EXPORTS: HorsePhotos
 * DEPENDS ON: useHorses, lucide-react
 * CONSUMED BY: HorseDetail (Photos tab)
 * TESTS: modules/horses/tests/HorsePhotos.test.tsx
 * LAST CHANGED: 2026-03-06 — Added hero image, placeholder with initials
 */

"use client"

import { Plus, Camera } from "lucide-react"
import { useHorses } from "@/modules/horses"

interface HorsePhotosProps {
  horseId: string
  horseName: string
}

const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

export function HorsePhotos({ horseId, horseName }: HorsePhotosProps) {
  const { horses, isLoading } = useHorses()
  const horse = horses.find((h) => h.id === horseId)
  const photos = horse?.photoUrls ?? []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C5F2E]" />
      </div>
    )
  }

  const handleAddPhoto = () => {
    alert("Photo upload available in V2")
  }

  // BREADCRUMB: Empty state with initials placeholder
  if (photos.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg overflow-hidden flex items-center justify-center h-[300px]" style={{ backgroundColor: "#1A1A2E" }}>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white/60" style={{ backgroundColor: "#2C5F2E" }}>
              {getInitials(horseName)}
            </div>
            <Camera className="h-6 w-6 mx-auto mt-4 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)] mt-2">No photos yet</p>
          </div>
        </div>
        <button onClick={handleAddPhoto} className="w-full py-3 rounded-md border border-dashed border-[var(--border)] flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] hover:border-[#2C5F2E] hover:text-[#2C5F2E]">
          <Plus className="h-4 w-4" />
          Add Photo
        </button>
      </div>
    )
  }

  const [hero, ...thumbnails] = photos

  return (
    <div className="space-y-4">
      {/* Hero image */}
      <div className="rounded-lg overflow-hidden">
        <img src={hero} alt={`${horseName} - Main`} className="w-full h-[300px] object-cover" />
      </div>

      {/* Thumbnails + Add button */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {thumbnails.map((url, i) => (
          <div key={i} className="flex-shrink-0 rounded-md overflow-hidden border-2 border-transparent hover:border-[#2C5F2E] transition-colors">
            <img src={url} alt={`${horseName} ${i + 2}`} className="w-20 h-20 object-cover" />
          </div>
        ))}
        <button onClick={handleAddPhoto} className="flex-shrink-0 w-20 h-20 rounded-md border border-dashed border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:border-[#2C5F2E] hover:text-[#2C5F2E]">
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
