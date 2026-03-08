/**
 * FILE: modules/horses/hooks/useDocuments.ts
 * ZONE: Yellow
 * PURPOSE: Hook to get documents for a specific horse from Supabase
 * EXPORTS: useDocuments
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: modules/horses/components/DocumentList
 * TESTS: modules/horses/tests/useDocuments.test.ts
 * LAST CHANGED: 2026-03-08 — V2: Wired to Supabase documents table
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { HorseDocument, DocumentType } from "@/lib/types"

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

// BREADCRUMB: Map category to DocumentType
function mapCategoryToType(category: string | null): DocumentType {
  const validTypes: DocumentType[] = ["vaccination", "passport", "insurance", "vet_report", "other"]
  if (category && validTypes.includes(category as DocumentType)) {
    return category as DocumentType
  }
  return "other"
}

// BREADCRUMB: Map DB row to HorseDocument type
function mapRowToDocument(row: DocumentRow): HorseDocument {
  return {
    id: row.id,
    horseId: row.entity_id,
    name: row.name,
    type: mapCategoryToType(row.category),
    fileUrl: row.file_url || "",
    fileSize: row.file_size || "",
    uploadedAt: row.uploaded_at,
    notes: row.notes || undefined,
  }
}

export function useDocuments(horseId: string): HorseDocument[] {
  const { currentUser } = useAuth()
  const [documents, setDocuments] = useState<HorseDocument[]>([])
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!currentUser?.stableId || !horseId) {
      setDocuments([])
      return
    }

    async function fetchDocuments() {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("stable_id", currentUser!.stableId)
        .eq("entity_type", "horse")
        .eq("entity_id", horseId)
        .order("uploaded_at", { ascending: false })

      if (error) {
        console.error("Failed to fetch horse documents:", error)
        setDocuments([])
      } else {
        setDocuments((data || []).map((row) => mapRowToDocument(row as DocumentRow)))
      }
    }

    fetchDocuments()
  }, [currentUser?.stableId, horseId, supabase])

  return documents
}
