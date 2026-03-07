/**
 * FILE: lib/hooks/useMediaQuery.ts
 * ZONE: Yellow
 * PURPOSE: Hook to detect media query matches for responsive design
 * EXPORTS: useMediaQuery, useIsMobile
 * DEPENDS ON: react
 * CONSUMED BY: components/layout/AppShell, all mobile-responsive components
 * TESTS: lib/hooks/useMediaQuery.test.ts
 * LAST CHANGED: 2026-03-07 — Initial creation for mobile responsiveness
 */

"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
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
