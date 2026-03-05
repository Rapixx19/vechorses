/**
 * FILE: app/horses/new/page.tsx
 * ZONE: Green
 * PURPOSE: Add new horse form page
 * EXPORTS: default (NewHorsePage)
 * DEPENDS ON: modules/horses
 * CONSUMED BY: Next.js routing
 * TESTS: app/horses/new/page.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

export default function NewHorsePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Add New Horse</h2>
      <p className="text-muted-foreground">
        Fill in the details to register a new horse.
      </p>
    </div>
  )
}
