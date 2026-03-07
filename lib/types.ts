/**
 * FILE: lib/types.ts
 * ZONE: Yellow
 * PURPOSE: Core domain types for the VecHorses platform
 * EXPORTS: Horse, Client, Stall, Task, BillingLineItem, HorseDocument, DocumentType, ClientDocument, ClientDocumentType, StallInstruction, StallInstructionPriority, StableSettings, Invoice, InvoiceStatus, Service, ServiceCategory, ServiceUnit, UserRole, ModulePermission, TeamMember, AuthUser, ModuleName
 * DEPENDS ON: None
 * CONSUMED BY: All modules, mock-data.ts
 * TESTS: lib/types.test.ts
 * LAST CHANGED: 2026-03-06 — Added auth types for role system
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
  photoUrl?: string
  isActive: boolean
  createdAt: string
}

export type ClientDocumentType = "contract" | "waiver" | "insurance" | "id_copy" | "other"

export interface ClientDocument {
  id: string
  clientId: string
  name: string
  type: ClientDocumentType
  fileUrl: string
  fileSize: string
  uploadedAt: string
  notes?: string
}

export type StallType = "standard" | "large" | "paddock"

export interface Stall {
  id: string
  label: string
  type: StallType
  horseId: string | null
  notes: string
  position: number
  rowIndex: number
  colIndex: number
  gridCols: number
  isMaintenance: boolean
}

// Floor Plan Layout Types
export type CellType = "empty" | "stall" | "wall" | "aisle" | "door"

export interface LayoutCell {
  row: number
  col: number
  type: CellType
  stallId?: string
  stallType?: StallType
  label?: string
  width: number
  height: number
}

export interface StableLayout {
  rows: number
  cols: number
  cells: LayoutCell[]
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

// V2 FEATURE: StallInstruction — worker task assignment per stall. Full implementation in V2.
export type StallInstructionPriority = "low" | "normal" | "high"

export interface StallInstruction {
  id: string
  stallId: string
  horseId?: string
  instruction: string
  assignedTo?: string
  priority: StallInstructionPriority
  completedAt?: string
  createdAt: string
  createdBy: string
}

// 🔴 RED ZONE — Billing settings and invoices
export interface StableSettings {
  stableName: string
  ownerName: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  vatNumber?: string
  logoUrl?: string
  bankName?: string
  bankIban?: string
  bankBic?: string
  invoicePrefix: string
  invoiceStartNumber: number
  billingDayOfMonth: number
  currency: string
  invoiceNotes?: string
  invoiceFooter?: string
  // Auto invoice settings
  autoInvoiceEnabled?: boolean
  autoInvoiceDay?: number
  autoInvoiceServices?: string[]
  autoInvoiceClients?: "all" | "selected"
  autoInvoiceSelectedClientIds?: string[]
  autoInvoiceEmailEnabled?: boolean
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled"
export type RecipientType = "client" | "custom"

export interface RecipientInfo {
  fullName: string
  companyName?: string
  email?: string
  address?: string
  city?: string
  country?: string
  vatNumber?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string | null
  recipientType: RecipientType
  recipientInfo?: RecipientInfo
  lineItems: BillingLineItem[]
  subtotal: number
  tax?: number
  taxRate?: number
  total: number
  status: InvoiceStatus
  issuedDate: string
  dueDate: string
  paidDate?: string
  notes?: string
  createdAt: string
}

// Service catalogue
export type ServiceCategory = "boarding" | "lessons" | "farrier" | "vet" | "grooming" | "training" | "competitions" | "feed" | "other"
export type ServiceUnit = "per_month" | "per_session" | "per_day" | "per_visit" | "per_item" | "custom"

export interface Service {
  id: string
  name: string
  description: string
  category: ServiceCategory
  price: number
  currency: string
  unit: ServiceUnit
  unitLabel?: string
  photoUrl?: string
  isActive: boolean
  createdAt: string
}

// Auth & Team Management
export type UserRole = "owner" | "manager" | "staff" | "custom"
export type ModuleName = "dashboard" | "horses" | "clients" | "stalls" | "billing" | "services" | "settings" | "staff" | "calendar" | "documents"

export interface ModulePermission {
  module: ModuleName
  canView: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface TeamMember {
  id: string
  fullName: string
  email: string
  role: UserRole
  permissions: ModulePermission[]
  isActive: boolean
  invitedAt: string
  lastLoginAt?: string
  avatarUrl?: string
}

export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: UserRole
  permissions: ModulePermission[]
  stableId?: string
  stableName?: string
}

// Staff Management Types
export type StaffStatusDetail = "working" | "vacation" | "sick" | "day-off" | "training"
export type ContractType = "full-time" | "part-time" | "freelance"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type TaskStatus = "pending" | "in-progress" | "completed" | "cancelled"
export type TaskCategory = "general" | "feeding" | "cleaning" | "medical" | "grooming" | "training" | "maintenance" | "other"

export interface StaffMember {
  id: string
  fullName: string
  email: string
  phone?: string
  address?: string
  dateOfBirth?: string
  startDate?: string
  contractType: ContractType
  statusDetail: StaffStatusDetail
  vacationStart?: string
  vacationEnd?: string
  notes?: string
  color?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  role: UserRole
  isActive: boolean
  avatarUrl?: string
  pendingTasksCount?: number
}

export interface StaffTask {
  id: string
  stableId: string
  assignedTo: string
  assignedBy?: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  dueTime?: string
  completedAt?: string
  category: TaskCategory
  horseId?: string
  horseName?: string
  createdAt: string
}

// Calendar Types
export type EventCategory = "general" | "vet" | "farrier" | "competition" | "training" | "feeding" | "vacation" | "meeting"

export interface CalendarEvent {
  id: string
  stableId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  allDay: boolean
  category: EventCategory
  color: string
  location?: string
  horseId?: string
  horseName?: string
  assignedTo: string[]
  assignedStaff?: { id: string; fullName: string; color?: string }[]
  createdBy?: string
  isRecurring: boolean
  recurrenceRule?: string
  externalId?: string
  externalSource?: string
  createdAt: string
}

export type CalendarViewMode = "month" | "week" | "day"
