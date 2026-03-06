/**
 * FILE: lib/mock/services.ts
 * ZONE: Yellow
 * PURPOSE: Mock services for V1 service catalogue
 * EXPORTS: mockServices
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: lib/mock/index.ts, modules/services/hooks/useServices
 * TESTS: lib/mock/services.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation for service management
 */

import type { Service } from "@/lib/types"

export const mockServices: Service[] = [
  // Boarding (2)
  { id: "svc-001", name: "Full Board", description: "Complete care including feed, turnout, and daily stall cleaning", category: "boarding", price: 45000, currency: "EUR", unit: "per_month", isActive: true, createdAt: "2025-01-01T00:00:00Z" },
  { id: "svc-002", name: "Partial Board", description: "Stall and basic care, owner provides feed", category: "boarding", price: 28000, currency: "EUR", unit: "per_month", isActive: true, createdAt: "2025-01-01T00:00:00Z" },

  // Lessons (3)
  { id: "svc-003", name: "Private Jumping Lesson", description: "One-on-one jumping instruction with certified trainer", category: "lessons", price: 6000, currency: "EUR", unit: "per_session", isActive: true, createdAt: "2025-01-01T00:00:00Z" },
  { id: "svc-004", name: "Group Dressage Lesson", description: "Small group dressage training, max 4 riders", category: "lessons", price: 3500, currency: "EUR", unit: "per_session", isActive: true, createdAt: "2025-01-01T00:00:00Z" },
  { id: "svc-005", name: "Lunge Lesson", description: "Focused seat and balance work on the lunge line", category: "lessons", price: 4500, currency: "EUR", unit: "per_session", isActive: true, createdAt: "2025-01-01T00:00:00Z" },

  // Farrier (2)
  { id: "svc-006", name: "Full Set Shoes", description: "Complete farrier service with new set of four shoes", category: "farrier", price: 12000, currency: "EUR", unit: "per_visit", isActive: true, createdAt: "2025-01-01T00:00:00Z" },
  { id: "svc-007", name: "Trim Only", description: "Barefoot trim and hoof care", category: "farrier", price: 4500, currency: "EUR", unit: "per_visit", isActive: true, createdAt: "2025-01-01T00:00:00Z" },

  // Vet (2)
  { id: "svc-008", name: "Annual Vaccination", description: "Flu, tetanus, and required competition vaccines", category: "vet", price: 8500, currency: "EUR", unit: "per_visit", isActive: true, createdAt: "2025-01-01T00:00:00Z" },
  { id: "svc-009", name: "Dental Float", description: "Complete dental examination and floating", category: "vet", price: 12000, currency: "EUR", unit: "per_visit", isActive: true, createdAt: "2025-01-01T00:00:00Z" },

  // Grooming (2)
  { id: "svc-010", name: "Full Groom", description: "Complete grooming including bath, clip, and trim", category: "grooming", price: 4000, currency: "EUR", unit: "per_session", isActive: true, createdAt: "2025-01-01T00:00:00Z" },
  { id: "svc-011", name: "Mane & Tail Treatment", description: "Deep conditioning and detangling treatment", category: "grooming", price: 2500, currency: "EUR", unit: "per_session", isActive: true, createdAt: "2025-01-01T00:00:00Z" },

  // Training (2)
  { id: "svc-012", name: "Daily Training", description: "Professional training session by stable trainer", category: "training", price: 8000, currency: "EUR", unit: "per_session", isActive: true, createdAt: "2025-01-01T00:00:00Z" },
  { id: "svc-013", name: "Show Preparation", description: "Intensive training and grooming for competition", category: "training", price: 15000, currency: "EUR", unit: "per_session", isActive: true, createdAt: "2025-01-01T00:00:00Z" },

  // Feed (3)
  { id: "svc-014", name: "Hay Supplement", description: "Additional hay beyond standard ration", category: "feed", price: 4500, currency: "EUR", unit: "per_month", isActive: true, createdAt: "2025-01-01T00:00:00Z" },
  { id: "svc-015", name: "Vitamin Package", description: "Daily vitamin and mineral supplements", category: "feed", price: 3500, currency: "EUR", unit: "per_month", isActive: true, createdAt: "2025-01-01T00:00:00Z" },
  { id: "svc-016", name: "Senior Feed Program", description: "Specialized nutrition for older horses", category: "feed", price: 5500, currency: "EUR", unit: "per_month", isActive: true, createdAt: "2025-01-01T00:00:00Z" },

  // Competitions (2)
  { id: "svc-017", name: "Show Entry Fee", description: "Competition entry and administrative fees", category: "competitions", price: 8000, currency: "EUR", unit: "per_item", isActive: true, createdAt: "2025-01-01T00:00:00Z" },
  { id: "svc-018", name: "Transport to Show", description: "Round-trip horse transport to competition venue", category: "competitions", price: 12000, currency: "EUR", unit: "per_item", isActive: true, createdAt: "2025-01-01T00:00:00Z" },

  // Other (2)
  { id: "svc-019", name: "Stable Insurance", description: "Third-party liability coverage while at stable", category: "other", price: 3500, currency: "EUR", unit: "per_month", isActive: true, createdAt: "2025-01-01T00:00:00Z" },
  { id: "svc-020", name: "Equipment Storage", description: "Secure tack room locker rental", category: "other", price: 2500, currency: "EUR", unit: "per_month", isActive: true, createdAt: "2025-01-01T00:00:00Z" },
]
