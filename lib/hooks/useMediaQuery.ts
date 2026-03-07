/**
 * FILE: lib/hooks/useMediaQuery.ts
 * ZONE: Yellow
 * PURPOSE: Hook to detect media query matches for responsive design (SSR-safe)
 * EXPORTS: useMediaQuery, useIsMobile, useIsTablet, useIsDesktop
 * DEPENDS ON: react
 * CONSUMED BY: components/layout/AppShell, all mobile-responsive components
 * TESTS: lib/hooks/useMediaQuery.test.ts
 * LAST CHANGED: 2026-03-07 — Fixed hydration mismatch by ensuring SSR returns false
 */

"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  // Always start with false to match SSR output and avoid hydration mismatch
  const [matches, setMatches] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Only access window APIs after mount (client-side only)
    if (typeof window === "undefined") return

    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Listen for changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query])

  // Return false during SSR and initial render to avoid hydration mismatch
  return mounted ? matches : false
}

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)")
}

export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)")
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)")
}
