/**
 * FILE: modules/clients/hooks/useClientDocuments.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch client documents filtered by clientId from Supabase
 * EXPORTS: useClientDocuments
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: ClientDocumentList, ClientDetail
 * TESTS: modules/clients/tests/useClientDocuments.test.ts
 * LAST CHANGED: 2026-03-08 — V2: Wired to Supabase documents table
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { ClientDocument, ClientDocumentType } from "@/lib/types"

// BREADCRUMB: DB row type
interface DocumentRow {
  id: string
  entity_id: string
  name: string
  category: string | null
  file_url: string | null
  file_size: string | null
  uploaded_at: string
  notes: string | null
}

// BREADCRUMB: Map category to ClientDocumentType
function mapCategoryToType(category: string | null): ClientDocumentType {
  const validTypes: ClientDocumentType[] = ["contract", "waiver", "insurance", "id_copy", "other"]
  if (category && validTypes.includes(category as ClientDocumentType)) {
    return category as ClientDocumentType
  }
  return "contract"
}

// BREADCRUMB: Map DB row to ClientDocument type
function mapRowToDocument(row: DocumentRow): ClientDocument {
  return {
    id: row.id,
    clientId: row.entity_id,
    name: row.name,
    type: mapCategoryToType(row.category),
    fileUrl: row.file_url || "",
    fileSize: row.file_size || "",
    uploadedAt: row.uploaded_at,
    notes: row.notes || undefined,
  }
}

export function useClientDocuments(clientId: string): ClientDocument[] {
  const { currentUser } = useAuth()
  const [documents, setDocuments] = useState<ClientDocument[]>([])
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!currentUser?.stableId || !clientId) {
      setDocuments([])
      return
    }

    async function fetchDocuments() {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("stable_id", currentUser!.stableId)
        .eq("entity_type", "client")
        .eq("entity_id", clientId)
        .order("uploaded_at", { ascending: false })

      if (error) {
        console.error("Failed to fetch client documents:", error)
        setDocuments([])
      } else {
        setDocuments((data || []).map((row) => mapRowToDocument(row as DocumentRow)))
      }
    }

    fetchDocuments()
  }, [currentUser?.stableId, clientId, supabase])

  return documents
}
