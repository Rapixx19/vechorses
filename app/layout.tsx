/**
 * FILE: app/layout.tsx
 * ZONE: Green
 * PURPOSE: Root layout with AuthProvider, dark theme, and PWA support
 * EXPORTS: metadata, viewport, default (RootLayout)
 * DEPENDS ON: components/layout/AuthLayout, globals.css
 * CONSUMED BY: Next.js App Router
 * TESTS: None (layout file)
 * LAST CHANGED: 2026-03-07 — Added mobile viewport, PWA meta tags
 */

import type { Metadata, Viewport } from "next"
import { AuthLayout } from "@/components/layout/AuthLayout"
import "./globals.css"

export const metadata: Metadata = {
  title: "VecHorses",
  description: "Horse stable management platform",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VecHorses",
  },
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <AuthLayout>{children}</AuthLayout>
      </body>
    </html>
  )
}
