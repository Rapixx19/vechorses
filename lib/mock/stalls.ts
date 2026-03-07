/**
 * FILE: lib/mock/stalls.ts
 * ZONE: Yellow
 * PURPOSE: Mock stall data for V1
 * EXPORTS: mockStalls
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: lib/mock/index.ts
 * TESTS: lib/mock/stalls.test.ts
 * LAST CHANGED: 2026-03-05 — Split from mock-data.ts
 */

import type { Stall } from "@/lib/types"

export const mockStalls: Stall[] = [
  // Block A - Stalls 1-10
  { id: "stall-a01", label: "Block A - Stall 1", type: "standard", horseId: "horse-001", notes: "" },
  { id: "stall-a02", label: "Block A - Stall 2", type: "standard", horseId: "horse-002", notes: "" },
  { id: "stall-a03", label: "Block A - Stall 3", type: "standard", horseId: "horse-003", notes: "" },
  { id: "stall-a04", label: "Block A - Stall 4", type: "standard", horseId: "horse-004", notes: "" },
  { id: "stall-a05", label: "Block A - Stall 5", type: "standard", horseId: "horse-005", notes: "" },
  { id: "stall-a06", label: "Block A - Stall 6", type: "large", horseId: "horse-006", notes: "" },
  { id: "stall-a07", label: "Block A - Stall 7", type: "large", horseId: "horse-007", notes: "" },
  { id: "stall-a08", label: "Block A - Stall 8", type: "standard", horseId: "horse-008", notes: "" },
  { id: "stall-a09", label: "Block A - Stall 9", type: "standard", horseId: "horse-009", notes: "" },
  { id: "stall-a10", label: "Block A - Stall 10", type: "standard", horseId: "horse-010", notes: "" },
  // Block B - Stalls 1-10
  { id: "stall-b01", label: "Block B - Stall 1", type: "standard", horseId: "horse-011", notes: "" },
  { id: "stall-b02", label: "Block B - Stall 2", type: "standard", horseId: "horse-012", notes: "" },
  { id: "stall-b03", label: "Block B - Stall 3", type: "standard", horseId: "horse-013", notes: "" },
  { id: "stall-b04", label: "Block B - Stall 4", type: "standard", horseId: "horse-014", notes: "" },
  { id: "stall-b05", label: "Block B - Stall 5", type: "standard", horseId: "horse-015", notes: "" },
  { id: "stall-b06", label: "Block B - Stall 6", type: "standard", horseId: "horse-016", notes: "" },
  { id: "stall-b07", label: "Block B - Stall 7", type: "standard", horseId: "horse-017", notes: "" },
  { id: "stall-b08", label: "Block B - Stall 8", type: "standard", horseId: "horse-018", notes: "" },
  { id: "stall-b09", label: "Block B - Stall 9", type: "standard", horseId: "horse-019", notes: "" },
  { id: "stall-b10", label: "Block B - Stall 10", type: "standard", horseId: "horse-020", notes: "" },
  // Block C - Stalls 1-10 (some paddocks)
  { id: "stall-c01", label: "Block C - Stall 1", type: "standard", horseId: "horse-021", notes: "" },
  { id: "stall-c02", label: "Block C - Stall 2", type: "standard", horseId: "horse-022", notes: "" },
  { id: "stall-c03", label: "Block C - Stall 3", type: "paddock", horseId: "horse-023", notes: "" },
  { id: "stall-c04", label: "Block C - Stall 4", type: "paddock", horseId: "horse-024", notes: "" },
  { id: "stall-c05", label: "Block C - Stall 5", type: "standard", horseId: "horse-025", notes: "" },
  { id: "stall-c06", label: "Block C - Stall 6", type: "standard", horseId: null, notes: "Under maintenance" },
  { id: "stall-c07", label: "Block C - Stall 7", type: "standard", horseId: null, notes: "" },
  { id: "stall-c08", label: "Block C - Stall 8", type: "large", horseId: null, notes: "" },
  { id: "stall-c09", label: "Block C - Stall 9", type: "standard", horseId: null, notes: "Reserved for new arrival" },
  { id: "stall-c10", label: "Block C - Stall 10", type: "standard", horseId: null, notes: "" },
]
