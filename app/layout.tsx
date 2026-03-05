/**
 * FILE: app/layout.tsx
 * ZONE: Green
 * PURPOSE: Root layout with AppShell and dark theme
 * EXPORTS: metadata, default (RootLayout)
 * DEPENDS ON: components/layout/AppShell, globals.css
 * CONSUMED BY: Next.js App Router
 * TESTS: None (layout file)
 * LAST CHANGED: 2026-03-05 — Added AppShell and dark theme
 */

import type { Metadata } from "next"
import { AppShell } from "@/components/layout/AppShell"
import "./globals.css"

export const metadata: Metadata = {
  title: "VecHorses",
  description: "Horse stable management platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
