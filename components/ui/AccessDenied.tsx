/**
 * FILE: components/ui/AccessDenied.tsx
 * ZONE: Green
 * PURPOSE: Access restricted message for unauthorized users
 * EXPORTS: AccessDenied
 * DEPENDS ON: lucide-react
 * CONSUMED BY: lib/middleware/withAuth.tsx
 * TESTS: components/ui/AccessDenied.test.tsx
 * LAST CHANGED: 2026-03-06 — Initial creation for auth system
 */

import { Lock } from "lucide-react"

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-[#252538] flex items-center justify-center mb-4">
        <Lock className="h-8 w-8 text-[var(--text-muted)]" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Access Restricted</h2>
      <p className="text-sm text-[var(--text-muted)] max-w-xs">
        You don&apos;t have permission to view this page. Contact your stable owner to request access.
      </p>
    </div>
  )
}
