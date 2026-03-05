/**
 * FILE: app/clients/page.tsx
 * ZONE: Green
 * PURPOSE: List all clients (horse owners) page
 * EXPORTS: default (ClientsPage)
 * DEPENDS ON: modules/clients
 * CONSUMED BY: Next.js routing
 * TESTS: app/clients/page.test.tsx
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

export default function ClientsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Clients</h2>
      <p className="text-muted-foreground">
        Manage horse owners and their contact information.
      </p>
    </div>
  )
}
