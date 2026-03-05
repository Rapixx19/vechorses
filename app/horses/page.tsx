/**
 * FILE: app/horses/page.tsx
 * ZONE: Green
 * PURPOSE: List all horses page
 * EXPORTS: default (HorsesPage)
 * DEPENDS ON: modules/horses
 * CONSUMED BY: Next.js routing
 * TESTS: app/horses/page.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

export default function HorsesPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Horses</h2>
      <p className="text-muted-foreground">
        Manage all horses in the stable.
      </p>
    </div>
  )
}
