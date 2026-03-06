/**
 * FILE: lib/types.ts
 * ZONE: Yellow
 * PURPOSE: Core domain types for the VecHorses platform
 * EXPORTS: Horse, Client, Stall, Task, BillingLineItem, HorseDocument, DocumentType
 * DEPENDS ON: None
 * CONSUMED BY: All modules, mock-data.ts
 * TESTS: lib/types.test.ts
 * LAST CHANGED: 2026-03-06 — Added HorseDocument type and photoUrls to Horse
 */

// BREADCRUMB: These types define the domain model. V2 will add Supabase row types.

export interface Horse {
  id: string
  name: string
  breed: string
  dateOfBirth: string
  color: string
  stallId: string | null
  ownerId: string
  medicalNotes: string
  feedingNotes: string
  photoUrl: string | null
  photoUrls: string[]
  isActive: boolean
  createdAt: string
}

export type DocumentType = "vaccination" | "passport" | "insurance" | "vet_report" | "other"

export interface HorseDocument {
  id: string
  horseId: string
  name: string
  type: DocumentType
  fileUrl: string
  fileSize: string
  uploadedAt: string
  notes?: string
}

export interface Client {
  id: string
  fullName: string
  email: string
  phone: string
  emergencyContactName: string
  emergencyContactPhone: string
  gdprConsentAt: string | null
  gdprConsentVersion: string | null
  notes: string
  isActive: boolean
  createdAt: string
}

export interface Stall {
  id: string
  label: string
  horseId: string | null
  notes: string
}

export type TaskType = "feeding" | "medication" | "farrier" | "vet" | "other"

export interface Task {
  id: string
  horseId: string
  type: TaskType
  title: string
  notes: string
  dueDate: string
  completedAt: string | null
  createdAt: string
}

export type ServiceType = "boarding" | "lesson" | "farrier" | "vet" | "other"
export type BillingStatus = "pending" | "invoiced" | "paid" | "cancelled"

export interface BillingLineItem {
  id: string
  clientId: string
  serviceType: ServiceType
  description: string
  amountCents: number
  currency: string
  status: BillingStatus
  serviceDate: string
  createdAt: string
}
