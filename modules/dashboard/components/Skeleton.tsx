/**
 * FILE: modules/dashboard/components/Skeleton.tsx
 * ZONE: Green
 * PURPOSE: Skeleton loading placeholder with shimmer animation
 * EXPORTS: Skeleton
 * DEPENDS ON: None
 * CONSUMED BY: All pages for loading states
 * TESTS: modules/dashboard/tests/Skeleton.test.tsx
 * LAST CHANGED: 2026-03-07 — Initial creation for loading states
 */

interface SkeletonProps {
  className?: string
}

// BREADCRUMB: Skeleton shimmer component for loading states - use instead of spinners
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#1A1D24] ${className}`}
      style={{
        background: "linear-gradient(90deg, #1A1D24 25%, #21252E 50%, #1A1D24 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  )
}
