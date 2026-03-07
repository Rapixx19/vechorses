/**
 * FILE: lib/mock/stalls.ts
 * ZONE: Yellow
 * PURPOSE: Mock stall data for V1
 * EXPORTS: mockStalls
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: lib/mock/index.ts
 * TESTS: lib/mock/stalls.test.ts
 * LAST CHANGED: 2026-03-07 — Added position fields for visual builder
 */

import type { Stall } from "@/lib/types"

// BREADCRUMB: Helper to create stall with position defaults
function createStall(
  id: string,
  label: string,
  type: Stall["type"],
  horseId: string | null,
  notes: string,
  position: number,
  isMaintenance = false
): Stall {
  return {
    id,
    label,
    type,
    horseId,
    notes,
    position,
    rowIndex: Math.floor(position / 4),
    colIndex: position % 4,
    gridCols: 4,
    isMaintenance,
  }
}

export const mockStalls: Stall[] = [
  // Block A - Stalls 1-10
  createStall("stall-a01", "Block A - Stall 1", "standard", "horse-001", "", 0),
  createStall("stall-a02", "Block A - Stall 2", "standard", "horse-002", "", 1),
  createStall("stall-a03", "Block A - Stall 3", "standard", "horse-003", "", 2),
  createStall("stall-a04", "Block A - Stall 4", "standard", "horse-004", "", 3),
  createStall("stall-a05", "Block A - Stall 5", "standard", "horse-005", "", 4),
  createStall("stall-a06", "Block A - Stall 6", "large", "horse-006", "", 5),
  createStall("stall-a07", "Block A - Stall 7", "large", "horse-007", "", 6),
  createStall("stall-a08", "Block A - Stall 8", "standard", "horse-008", "", 7),
  createStall("stall-a09", "Block A - Stall 9", "standard", "horse-009", "", 8),
  createStall("stall-a10", "Block A - Stall 10", "standard", "horse-010", "", 9),
  // Block B - Stalls 1-10
  createStall("stall-b01", "Block B - Stall 1", "standard", "horse-011", "", 10),
  createStall("stall-b02", "Block B - Stall 2", "standard", "horse-012", "", 11),
  createStall("stall-b03", "Block B - Stall 3", "standard", "horse-013", "", 12),
  createStall("stall-b04", "Block B - Stall 4", "standard", "horse-014", "", 13),
  createStall("stall-b05", "Block B - Stall 5", "standard", "horse-015", "", 14),
  createStall("stall-b06", "Block B - Stall 6", "standard", "horse-016", "", 15),
  createStall("stall-b07", "Block B - Stall 7", "standard", "horse-017", "", 16),
  createStall("stall-b08", "Block B - Stall 8", "standard", "horse-018", "", 17),
  createStall("stall-b09", "Block B - Stall 9", "standard", "horse-019", "", 18),
  createStall("stall-b10", "Block B - Stall 10", "standard", "horse-020", "", 19),
  // Block C - Stalls 1-10 (some paddocks)
  createStall("stall-c01", "Block C - Stall 1", "standard", "horse-021", "", 20),
  createStall("stall-c02", "Block C - Stall 2", "standard", "horse-022", "", 21),
  createStall("stall-c03", "Block C - Stall 3", "paddock", "horse-023", "", 22),
  createStall("stall-c04", "Block C - Stall 4", "paddock", "horse-024", "", 23),
  createStall("stall-c05", "Block C - Stall 5", "standard", "horse-025", "", 24),
  createStall("stall-c06", "Block C - Stall 6", "standard", null, "Under maintenance", 25, true),
  createStall("stall-c07", "Block C - Stall 7", "standard", null, "", 26),
  createStall("stall-c08", "Block C - Stall 8", "large", null, "", 27),
  createStall("stall-c09", "Block C - Stall 9", "standard", null, "Reserved for new arrival", 28),
  createStall("stall-c10", "Block C - Stall 10", "standard", null, "", 29),
]
