/**
 * FILE: app/layout.tsx
 * ZONE: Green
 * PURPOSE: Root layout with AuthProvider and dark theme
 * EXPORTS: metadata, default (RootLayout)
 * DEPENDS ON: components/layout/AuthLayout, globals.css
 * CONSUMED BY: Next.js App Router
 * TESTS: None (layout file)
 * LAST CHANGED: 2026-03-06 — Added AuthLayout for auth system
 */

import type { Metadata } from "next"
import { AuthLayout } from "@/components/layout/AuthLayout"
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
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <AuthLayout>{children}</AuthLayout>
      </body>
    </html>
  )
}
