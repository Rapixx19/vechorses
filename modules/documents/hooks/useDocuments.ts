/**
 * FILE: modules/documents/hooks/useDocuments.ts
 * ZONE: Yellow
 * PURPOSE: Hook to fetch and manage documents from Supabase
 * EXPORTS: useDocuments, useAddDocument, useUpdateDocument, useDeleteDocument
 * DEPENDS ON: lib/supabase.ts, lib/types.ts, lib/hooks/useAuth.ts
 * CONSUMED BY: modules/documents/components/*
 * TESTS: modules/documents/tests/useDocuments.test.ts
 * LAST CHANGED: 2026-03-07 — Initial creation for documents module
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/lib/hooks/useAuth"
import type { Document, DocumentCategory, DocumentEntityType, DocumentStatus } from "@/lib/types"

// BREADCRUMB: DB row type for documents table
interface DocumentRow {
  id: string
  stable_id: string
  entity_type: string
  entity_id: string
  name: string
  title: string | null
  category: string | null
  file_url: string | null
  file_size: string | null
  document_date: string | null
  expiry_date: string | null
  issued_by: string | null
  reference_number: string | null
  tags: string[] | null
  notes: string | null
  uploaded_by: string | null
  uploaded_at: string
  ai_summary: string | null
  status: string | null
}

// BREADCRUMB: Calculate document status based on expiry date
function calculateStatus(expiryDate: string | null): DocumentStatus {
  if (!expiryDate) return "valid"
  const expiry = new Date(expiryDate)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return "expired"
  if (daysUntilExpiry <= 30) return "expiring"
  return "valid"
}

// BREADCRUMB: Map DB row to Document type
function mapRowToDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    stableId: row.stable_id,
    entityType: row.entity_type as DocumentEntityType,
    entityId: row.entity_id,
    name: row.name,
    title: row.title || undefined,
    category: (row.category as DocumentCategory) || "other",
    fileUrl: row.file_url,
    fileSize: row.file_size,
    documentDate: row.document_date,
    expiryDate: row.expiry_date,
    issuedBy: row.issued_by,
    referenceNumber: row.reference_number,
    tags: row.tags || [],
    notes: row.notes,
    uploadedBy: row.uploaded_by,
    uploadedAt: row.uploaded_at,
    aiSummary: row.ai_summary,
    status: calculateStatus(row.expiry_date),
  }
}

// BREADCRUMB: Category groups for filtering
export const CATEGORY_GROUPS = {
  all: null,
  stable: ["stable_license", "stable_insurance", "stable_contract"],
  horses: ["horse_passport", "horse_vaccination", "horse_insurance", "horse_medical"],
  clients: ["client_contract", "client_insurance", "client_invoice"],
  staff: ["staff_contract", "staff_certification"],
  financial: ["financial_report", "client_invoice"],
  compliance: ["compliance_audit", "stable_license"],
} as const

export type CategoryGroup = keyof typeof CATEGORY_GROUPS

export function useDocuments(categoryGroup?: CategoryGroup) {
  const { currentUser } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!currentUser?.stableId) {
      setDocuments([])
      setIsLoading(false)
      return
    }

    async function fetchDocuments() {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from("documents")
        .select("*")
        .eq("stable_id", currentUser!.stableId)
        .order("uploaded_at", { ascending: false })

      // Filter by category group if specified
      if (categoryGroup && categoryGroup !== "all") {
        const categories = CATEGORY_GROUPS[categoryGroup]
        if (categories) {
          query = query.in("category", categories)
        }
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error("Failed to fetch documents:", fetchError)
        setError(fetchError.message)
        setDocuments([])
      } else {
        setDocuments((data || []).map((row) => mapRowToDocument(row as DocumentRow)))
      }

      setIsLoading(false)
    }

    fetchDocuments()
  }, [currentUser?.stableId, categoryGroup, supabase, refetchTrigger])

  const refetch = useCallback(() => setRefetchTrigger((n) => n + 1), [])

  return { documents, isLoading, error, refetch }
}

export interface AddDocumentInput {
  entityType: DocumentEntityType
  entityId: string
  name: string
  title?: string
  category: DocumentCategory
  fileUrl?: string
  fileSize?: string
  documentDate?: string
  expiryDate?: string
  issuedBy?: string
  referenceNumber?: string
  tags?: string[]
  notes?: string
}

export function useAddDocument() {
  const { currentUser } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const addDocument = useCallback(
    async (input: AddDocumentInput): Promise<{ success: boolean; error?: string; id?: string }> => {
      if (!currentUser?.stableId) {
        return { success: false, error: "No stable ID" }
      }

      const { data, error } = await supabase
        .from("documents")
        .insert({
          stable_id: currentUser.stableId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          name: input.name,
          title: input.title || input.name,
          category: input.category,
          file_url: input.fileUrl || null,
          file_size: input.fileSize || null,
          document_date: input.documentDate || null,
          expiry_date: input.expiryDate || null,
          issued_by: input.issuedBy || null,
          reference_number: input.referenceNumber || null,
          tags: input.tags || [],
          notes: input.notes || null,
          uploaded_by: currentUser.id,
          status: calculateStatus(input.expiryDate || null),
        })
        .select("id")
        .single()

      if (error) {
        console.error("addDocument error:", error)
        return { success: false, error: error.message }
      }

      return { success: true, id: data.id }
    },
    [currentUser, supabase]
  )

  return { addDocument }
}

export function useUpdateDocument() {
  const supabase = useMemo(() => createClient(), [])

  const updateDocument = useCallback(
    async (id: string, updates: Partial<AddDocumentInput>): Promise<boolean> => {
      const dbUpdates: Record<string, unknown> = {}

      if (updates.entityType !== undefined) dbUpdates.entity_type = updates.entityType
      if (updates.entityId !== undefined) dbUpdates.entity_id = updates.entityId
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.title !== undefined) dbUpdates.title = updates.title
      if (updates.category !== undefined) dbUpdates.category = updates.category
      if (updates.fileUrl !== undefined) dbUpdates.file_url = updates.fileUrl || null
      if (updates.fileSize !== undefined) dbUpdates.file_size = updates.fileSize || null
      if (updates.documentDate !== undefined) dbUpdates.document_date = updates.documentDate || null
      if (updates.expiryDate !== undefined) {
        dbUpdates.expiry_date = updates.expiryDate || null
        dbUpdates.status = calculateStatus(updates.expiryDate || null)
      }
      if (updates.issuedBy !== undefined) dbUpdates.issued_by = updates.issuedBy || null
      if (updates.referenceNumber !== undefined) dbUpdates.reference_number = updates.referenceNumber || null
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags || []
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null

      const { error } = await supabase.from("documents").update(dbUpdates).eq("id", id)

      if (error) {
        console.error("updateDocument error:", error)
        return false
      }
      return true
    },
    [supabase]
  )

  const updateAiSummary = useCallback(
    async (id: string, summary: string): Promise<boolean> => {
      const { error } = await supabase
        .from("documents")
        .update({ ai_summary: summary })
        .eq("id", id)

      if (error) {
        console.error("updateAiSummary error:", error)
        return false
      }
      return true
    },
    [supabase]
  )

  return { updateDocument, updateAiSummary }
}

export function useDeleteDocument() {
  const supabase = useMemo(() => createClient(), [])

  const deleteDocument = useCallback(
    async (id: string): Promise<boolean> => {
      const { error } = await supabase.from("documents").delete().eq("id", id)

      if (error) {
        console.error("deleteDocument error:", error)
        return false
      }
      return true
    },
    [supabase]
  )

  return { deleteDocument }
}
