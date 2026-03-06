/**
 * FILE: lib/mock/documents.ts
 * ZONE: Yellow
 * PURPOSE: Mock horse documents for V1
 * EXPORTS: mockDocuments
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: lib/mock/index.ts
 * TESTS: lib/mock/documents.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

import type { HorseDocument } from "@/lib/types"

export const mockDocuments: HorseDocument[] = [
  { id: "doc-001", horseId: "horse-001", name: "Vaccination Certificate 2025.pdf", type: "vaccination", fileUrl: "#", fileSize: "1.2 MB", uploadedAt: "2025-01-15T10:00:00Z" },
  { id: "doc-002", horseId: "horse-001", name: "Horse Passport - Tempesta.pdf", type: "passport", fileUrl: "#", fileSize: "3.4 MB", uploadedAt: "2024-06-20T14:30:00Z" },
  { id: "doc-003", horseId: "horse-002", name: "Insurance Policy 2025.pdf", type: "insurance", fileUrl: "#", fileSize: "2.1 MB", uploadedAt: "2025-02-01T09:00:00Z" },
  { id: "doc-004", horseId: "horse-002", name: "Arthritis X-Ray Report.pdf", type: "vet_report", fileUrl: "#", fileSize: "5.8 MB", uploadedAt: "2024-11-10T16:00:00Z", notes: "Left front fetlock assessment" },
  { id: "doc-005", horseId: "horse-004", name: "Horse Passport - Conquistador.pdf", type: "passport", fileUrl: "#", fileSize: "3.2 MB", uploadedAt: "2023-12-01T11:00:00Z" },
  { id: "doc-006", horseId: "horse-004", name: "Tendon Injury Recovery Report.pdf", type: "vet_report", fileUrl: "#", fileSize: "1.8 MB", uploadedAt: "2023-09-15T13:00:00Z" },
  { id: "doc-007", horseId: "horse-007", name: "Navicular Diagnosis Report.pdf", type: "vet_report", fileUrl: "#", fileSize: "4.2 MB", uploadedAt: "2024-02-20T15:00:00Z" },
  { id: "doc-008", horseId: "horse-008", name: "Metabolic Panel Results.pdf", type: "vet_report", fileUrl: "#", fileSize: "0.8 MB", uploadedAt: "2024-08-05T10:30:00Z", notes: "Insulin resistance confirmed" },
  { id: "doc-009", horseId: "horse-010", name: "Ulcer Scope Report - March 2026.pdf", type: "vet_report", fileUrl: "#", fileSize: "2.4 MB", uploadedAt: "2026-03-01T09:00:00Z" },
  { id: "doc-010", horseId: "horse-010", name: "Competition License 2026.pdf", type: "other", fileUrl: "#", fileSize: "0.5 MB", uploadedAt: "2026-01-10T12:00:00Z" },
  { id: "doc-011", horseId: "horse-013", name: "Horse Passport - Serenity.pdf", type: "passport", fileUrl: "#", fileSize: "3.1 MB", uploadedAt: "2024-07-15T11:00:00Z" },
  { id: "doc-012", horseId: "horse-015", name: "Vaccination Certificate 2026.pdf", type: "vaccination", fileUrl: "#", fileSize: "1.1 MB", uploadedAt: "2026-02-28T14:00:00Z" },
  { id: "doc-013", horseId: "horse-015", name: "Horse Passport - Thunder.pdf", type: "passport", fileUrl: "#", fileSize: "3.5 MB", uploadedAt: "2024-09-01T10:00:00Z" },
  { id: "doc-014", horseId: "horse-021", name: "Feather Mite Treatment Log.pdf", type: "vet_report", fileUrl: "#", fileSize: "0.9 MB", uploadedAt: "2025-06-10T16:30:00Z" },
  { id: "doc-015", horseId: "horse-023", name: "Cushings Treatment Plan.pdf", type: "vet_report", fileUrl: "#", fileSize: "1.4 MB", uploadedAt: "2024-03-20T11:00:00Z", notes: "Pergolide dosage schedule" },
]
