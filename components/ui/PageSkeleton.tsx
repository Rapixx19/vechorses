/**
 * FILE: components/ui/PageSkeleton.tsx
 * ZONE: Green
 * PURPOSE: Reusable skeleton loading components for consistent loading states
 * EXPORTS: PageSkeleton, SkeletonCard, SkeletonText, SkeletonAvatar
 * DEPENDS ON: react
 * CONSUMED BY: All modules requiring loading states
 * TESTS: components/ui/tests/PageSkeleton.test.tsx
 * LAST CHANGED: 2026-03-14 — Initial creation for UI consistency audit
 */

"use client"

export function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[#252538] rounded ${className}`}
      style={{
        background: "linear-gradient(90deg, #252538 25%, #2a2a45 50%, #252538 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  )
}

export function SkeletonText({
  width = "w-full",
  height = "h-4",
  className = "",
}: {
  width?: string
  height?: string
  className?: string
}) {
  return <SkeletonPulse className={`${width} ${height} rounded ${className}`} />
}

export function SkeletonAvatar({ size = "w-10 h-10" }: { size?: string }) {
  return <SkeletonPulse className={`${size} rounded-full`} />
}

export function SkeletonCard() {
  return (
    <div className="bg-[#1A1A2E] border border-[#2a2a3e] rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <SkeletonText width="w-3/4" />
          <SkeletonText width="w-1/2" height="h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonText />
        <SkeletonText width="w-5/6" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-[#1A1A2E] border border-[#2a2a3e] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-[#2a2a3e]">
        <SkeletonText width="w-24" />
        <SkeletonText width="w-32" />
        <SkeletonText width="w-20" />
        <SkeletonText width="w-16" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-[#2a2a3e] last:border-0">
          <SkeletonAvatar size="w-8 h-8" />
          <SkeletonText width="w-24" />
          <SkeletonText width="w-32" />
          <SkeletonText width="w-20" />
          <SkeletonText width="w-16" />
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton({
  count = 6,
  variant = "cards",
}: {
  count?: number
  variant?: "cards" | "table" | "list"
}) {
  if (variant === "table") {
    return <SkeletonTable rows={count} />
  }

  if (variant === "list") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-[#1A1A2E] border border-[#2a2a3e] rounded-xl">
            <SkeletonAvatar />
            <div className="flex-1 space-y-2">
              <SkeletonText width="w-1/3" />
              <SkeletonText width="w-1/4" height="h-3" />
            </div>
            <SkeletonText width="w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#1A1A2E] border border-[#2a2a3e] rounded-2xl p-5">
            <SkeletonText width="w-20" height="h-3" />
            <SkeletonText width="w-16" height="h-8" className="mt-2" />
          </div>
        ))}
      </div>
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
