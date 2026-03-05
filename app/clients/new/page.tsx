/**
 * FILE: app/clients/new/page.tsx
 * ZONE: Green
 * PURPOSE: Add new client form page
 * EXPORTS: default (NewClientPage)
 * DEPENDS ON: modules/clients
 * CONSUMED BY: Next.js routing
 * TESTS: app/clients/new/page.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

export default function NewClientPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Add New Client</h2>
      <p className="text-muted-foreground">
        Register a new horse owner.
      </p>
    </div>
  )
}
