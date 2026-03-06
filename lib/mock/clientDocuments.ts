/**
 * FILE: lib/mock/clientDocuments.ts
 * ZONE: Yellow
 * PURPOSE: Mock client document data for V1
 * EXPORTS: mockClientDocuments
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: lib/mock/index.ts
 * TESTS: lib/mock/clientDocuments.test.ts
 * LAST CHANGED: 2026-03-06 — Initial creation
 */

import type { ClientDocument } from "@/lib/types"

export const mockClientDocuments: ClientDocument[] = [
  {
    id: "cdoc-001",
    clientId: "client-001",
    name: "Boarding Contract 2025 - Marco Bianchi.pdf",
    type: "contract",
    fileUrl: "#",
    fileSize: "1.2 MB",
    uploadedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "cdoc-002",
    clientId: "client-001",
    name: "Liability Waiver - Marco Bianchi.pdf",
    type: "waiver",
    fileUrl: "#",
    fileSize: "856 KB",
    uploadedAt: "2025-01-15T10:05:00Z",
  },
  {
    id: "cdoc-003",
    clientId: "client-002",
    name: "Boarding Contract 2025 - Sofia Rossi.pdf",
    type: "contract",
    fileUrl: "#",
    fileSize: "1.1 MB",
    uploadedAt: "2025-02-10T14:30:00Z",
  },
  {
    id: "cdoc-004",
    clientId: "client-002",
    name: "Liability Waiver - Sofia Rossi.pdf",
    type: "waiver",
    fileUrl: "#",
    fileSize: "892 KB",
    uploadedAt: "2025-02-10T14:35:00Z",
  },
  {
    id: "cdoc-005",
    clientId: "client-003",
    name: "Insurance Certificate - Alessandro Ferrari.pdf",
    type: "insurance",
    fileUrl: "#",
    fileSize: "2.8 MB",
    uploadedAt: "2025-03-05T09:00:00Z",
  },
  {
    id: "cdoc-006",
    clientId: "client-003",
    name: "Boarding Contract 2025 - Alessandro Ferrari.pdf",
    type: "contract",
    fileUrl: "#",
    fileSize: "1.3 MB",
    uploadedAt: "2025-03-05T09:10:00Z",
  },
  {
    id: "cdoc-007",
    clientId: "client-003",
    name: "ID Copy - Alessandro Ferrari.pdf",
    type: "id_copy",
    fileUrl: "#",
    fileSize: "512 KB",
    uploadedAt: "2025-03-05T09:15:00Z",
  },
  {
    id: "cdoc-008",
    clientId: "client-004",
    name: "Liability Waiver - Giulia Conti.pdf",
    type: "waiver",
    fileUrl: "#",
    fileSize: "765 KB",
    uploadedAt: "2025-04-12T11:00:00Z",
  },
  {
    id: "cdoc-009",
    clientId: "client-005",
    name: "Boarding Contract 2025 - Francesco Moretti.pdf",
    type: "contract",
    fileUrl: "#",
    fileSize: "1.4 MB",
    uploadedAt: "2025-01-20T16:00:00Z",
  },
  {
    id: "cdoc-010",
    clientId: "client-005",
    name: "Insurance Certificate - Francesco Moretti.pdf",
    type: "insurance",
    fileUrl: "#",
    fileSize: "3.1 MB",
    uploadedAt: "2025-05-08T10:30:00Z",
  },
  {
    id: "cdoc-011",
    clientId: "client-006",
    name: "Boarding Contract 2025 - Chiara Lombardi.pdf",
    type: "contract",
    fileUrl: "#",
    fileSize: "1.2 MB",
    uploadedAt: "2025-06-01T09:00:00Z",
  },
  {
    id: "cdoc-012",
    clientId: "client-007",
    name: "Liability Waiver - Matteo Romano.pdf",
    type: "waiver",
    fileUrl: "#",
    fileSize: "798 KB",
    uploadedAt: "2025-07-15T14:00:00Z",
  },
  {
    id: "cdoc-013",
    clientId: "client-007",
    name: "ID Copy - Matteo Romano.pdf",
    type: "id_copy",
    fileUrl: "#",
    fileSize: "624 KB",
    uploadedAt: "2025-07-15T14:10:00Z",
  },
  {
    id: "cdoc-014",
    clientId: "client-008",
    name: "Boarding Contract 2025 - Valentina Greco.pdf",
    type: "contract",
    fileUrl: "#",
    fileSize: "1.5 MB",
    uploadedAt: "2025-08-20T11:30:00Z",
  },
  {
    id: "cdoc-015",
    clientId: "client-008",
    name: "Insurance Certificate - Valentina Greco.pdf",
    type: "insurance",
    fileUrl: "#",
    fileSize: "2.4 MB",
    uploadedAt: "2025-08-20T11:45:00Z",
  },
]
