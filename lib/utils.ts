/**
 * FILE: lib/utils.ts
 * ZONE: Yellow
 * PURPOSE: Utility functions for className merging and general helpers
 * EXPORTS: cn
 * DEPENDS ON: clsx, tailwind-merge
 * CONSUMED BY: All components using Tailwind classes
 * TESTS: lib/utils.test.ts
 * LAST CHANGED: 2026-03-05 — Initial creation
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// BREADCRUMB: cn() merges Tailwind classes intelligently, used by all UI components
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
