/**
 * FILE: modules/assistant/components/ActionCard.tsx
 * ZONE: Green
 * PURPOSE: Rich visual cards showing AI actions and display data
 * EXPORTS: ActionCard, DisplayCard
 * DEPENDS ON: lucide-react, next/link
 * CONSUMED BY: MessageBubble
 * TESTS: modules/assistant/tests/ActionCard.test.tsx
 * LAST CHANGED: 2026-03-08 — Rich display cards for all entity types
 */

"use client"

import Link from "next/link"
import {
  Calendar,
  UserPlus,
  Users,
  FileSearch,
  CheckSquare,
  Receipt,
  Undo2,
  User,
  Phone,
  Mail,
  FileText,
  Download,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  Send,
  Trash2,
  Plus,
  Brain,
  Lightbulb,
  Bell,
  Tag,
  StickyNote,
  Euro,
  Stethoscope,
  Scissors,
  Trophy,
  Dumbbell,
  Utensils,
  Plane,
  Star,
} from "lucide-react"

// Horse icon (custom since lucide doesn't have one)
function HorseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 9s-2-1-4-1-3 2-5 2-3-1-5-1-4 1-4 1l-1 2c0 1 1 2 3 2 1 0 2-1 3-1 2 0 3 3 3 5v4h2v-4c0-2 1-5 3-5 1 0 2 1 3 1 2 0 3-1 3-2l-1-2z" />
      <circle cx="6" cy="6" r="2" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface ActionCardProps {
  type: string
  data: Record<string, unknown>
  onUndo?: () => void
}

interface DisplayCardProps {
  type: "client_info" | "horse_info" | "documents" | "invoices" | "tasks" | "memories" | "balance" | "events" | "staff"
  data: unknown
}

interface ClientInfo {
  id: string
  fullName: string
  email?: string
  phone?: string
  horsesCount?: number
  horseNames?: string[]
  outstanding?: number
  currency?: string
  isActive?: boolean
}

interface HorseInfo {
  id: string
  name: string
  breed?: string
  color?: string
  age?: number
  dateOfBirth?: string
  ownerName?: string
  ownerId?: string
  stallLabel?: string
  isActive?: boolean
  photoUrl?: string
}

interface DocumentInfo {
  id: string
  name: string
  category: string
  entityType: string
  entityName?: string
  status: "valid" | "expiring" | "expired"
  expiryDate?: string
  fileUrl?: string
}

interface InvoiceInfo {
  id: string
  invoiceNumber: string
  clientName?: string
  total: number
  currency?: string
  status: "draft" | "sent" | "paid" | "cancelled"
  issuedDate: string
  dueDate?: string
}

interface TaskInfo {
  id: string
  title: string
  description?: string
  assignedTo?: string
  assigneeName?: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in-progress" | "completed" | "cancelled"
  dueDate?: string
  horseName?: string
  category?: string
}

interface MemoryInfo {
  id: string
  memoryType: "preference" | "fact" | "reminder" | "alias" | "note"
  key: string
  value: string
  importance?: number
}

interface BalanceInfo {
  clientId?: string
  clientName?: string
  outstanding: number
  paid: number
  total: number
  currency?: string
  invoiceCount?: number
  pendingCount?: number
}

interface EventInfo {
  id: string
  title: string
  startTime: string
  endTime?: string
  allDay?: boolean
  category: string
  location?: string
  horseName?: string
  assignedStaff?: { fullName: string }[]
}

interface StaffInfo {
  id: string
  fullName: string
  email?: string
  phone?: string
  role?: string
  statusDetail?: string
  contractType?: string
  pendingTasksCount?: number
  avatarUrl?: string
}

// ═══════════════════════════════════════════════════════════════════
// ACTION CARD CONFIGS
// ═══════════════════════════════════════════════════════════════════

const actionConfigs: Record<
  string,
  {
    icon: React.ElementType
    title: string
    bgColor: string
    textColor: string
    borderColor: string
    href?: (data: Record<string, unknown>) => string
  }
> = {
  ADD_CALENDAR_EVENT: {
    icon: Calendar,
    title: "Event Scheduled",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    href: () => "/calendar",
  },
  UPDATE_CALENDAR_EVENT: {
    icon: Calendar,
    title: "Event Updated",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    href: () => "/calendar",
  },
  DELETE_CALENDAR_EVENT: {
    icon: Calendar,
    title: "Event Deleted",
    bgColor: "bg-red-500/10",
    textColor: "text-red-400",
    borderColor: "border-red-500/30",
    href: () => "/calendar",
  },
  ADD_CLIENT: {
    icon: UserPlus,
    title: "Client Added",
    bgColor: "bg-green-500/10",
    textColor: "text-green-400",
    borderColor: "border-green-500/30",
    href: (data) => `/clients/${data.clientId || ""}`,
  },
  UPDATE_CLIENT: {
    icon: User,
    title: "Client Updated",
    bgColor: "bg-green-500/10",
    textColor: "text-green-400",
    borderColor: "border-green-500/30",
    href: (data) => `/clients/${data.clientId || ""}`,
  },
  ADD_HORSE: {
    icon: HorseIcon,
    title: "Horse Added",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    href: (data) => `/horses/${data.horseId || ""}`,
  },
  UPDATE_HORSE: {
    icon: HorseIcon,
    title: "Horse Updated",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    href: (data) => `/horses/${data.horseId || ""}`,
  },
  ASSIGN_STALL: {
    icon: MapPin,
    title: "Stall Assigned",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    href: () => "/stalls",
  },
  UPDATE_STAFF_STATUS: {
    icon: Users,
    title: "Status Updated",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    href: () => "/staff",
  },
  ADD_STAFF: {
    icon: UserPlus,
    title: "Staff Added",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    href: () => "/staff",
  },
  FIND_DOCUMENT: {
    icon: FileSearch,
    title: "Document Found",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    href: () => "/documents",
  },
  UPLOAD_DOCUMENT: {
    icon: FileText,
    title: "Document Uploaded",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    href: () => "/documents",
  },
  CREATE_TASK: {
    icon: CheckSquare,
    title: "Task Created",
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    href: () => "/staff",
  },
  UPDATE_TASK: {
    icon: CheckSquare,
    title: "Task Updated",
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    href: () => "/staff",
  },
  COMPLETE_TASK: {
    icon: CheckCircle2,
    title: "Task Completed",
    bgColor: "bg-green-500/10",
    textColor: "text-green-400",
    borderColor: "border-green-500/30",
    href: () => "/staff",
  },
  CREATE_INVOICE: {
    icon: Receipt,
    title: "Invoice Created",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    href: (data) => `/billing?invoice=${data.invoiceId || ""}`,
  },
  SEND_INVOICE: {
    icon: Send,
    title: "Invoice Sent",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    href: (data) => `/billing?invoice=${data.invoiceId || ""}`,
  },
  MARK_INVOICE_PAID: {
    icon: CreditCard,
    title: "Invoice Paid",
    bgColor: "bg-green-500/10",
    textColor: "text-green-400",
    borderColor: "border-green-500/30",
    href: (data) => `/billing?invoice=${data.invoiceId || ""}`,
  },
  ADD_SERVICE: {
    icon: Plus,
    title: "Service Added",
    bgColor: "bg-indigo-500/10",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    href: () => "/services",
  },
  REMEMBER: {
    icon: Brain,
    title: "Memory Saved",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-400",
    borderColor: "border-pink-500/30",
  },
  RECALL: {
    icon: Lightbulb,
    title: "Memory Recalled",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-400",
    borderColor: "border-pink-500/30",
  },
  FORGET: {
    icon: Trash2,
    title: "Memory Removed",
    bgColor: "bg-red-500/10",
    textColor: "text-red-400",
    borderColor: "border-red-500/30",
  },
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function getCurrencySymbol(currency?: string): string {
  switch (currency?.toUpperCase()) {
    case "EUR": return "\u20ac"
    case "USD": return "$"
    case "GBP": return "\u00a3"
    case "CHF": return "CHF "
    default: return "\u20ac"
  }
}

function formatCurrency(amount: number, currency?: string): string {
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(dateString?: string): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function formatTime(dateString?: string): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

function calculateAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null
  const birth = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case "valid":
    case "paid":
    case "completed":
    case "working":
      return { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" }
    case "expiring":
    case "sent":
    case "in-progress":
    case "vacation":
      return { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" }
    case "expired":
    case "cancelled":
    case "sick":
      return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" }
    case "draft":
    case "pending":
    case "day-off":
      return { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30" }
    default:
      return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" }
  }
}

function getPriorityColor(priority: string): { bg: string; text: string } {
  switch (priority) {
    case "urgent":
      return { bg: "bg-red-500/20", text: "text-red-400" }
    case "high":
      return { bg: "bg-orange-500/20", text: "text-orange-400" }
    case "medium":
      return { bg: "bg-yellow-500/20", text: "text-yellow-400" }
    case "low":
    default:
      return { bg: "bg-gray-500/20", text: "text-gray-400" }
  }
}

function getEventCategoryIcon(category: string): React.ElementType {
  switch (category) {
    case "vet": return Stethoscope
    case "farrier": return Scissors
    case "competition": return Trophy
    case "training": return Dumbbell
    case "feeding": return Utensils
    case "vacation": return Plane
    case "meeting": return Users
    default: return Calendar
  }
}

function getMemoryTypeIcon(memoryType: string): React.ElementType {
  switch (memoryType) {
    case "preference": return Star
    case "fact": return Lightbulb
    case "reminder": return Bell
    case "alias": return Tag
    case "note": return StickyNote
    default: return Brain
  }
}

// ═══════════════════════════════════════════════════════════════════
// ACTION CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function ActionCard({ type, data, onUndo }: ActionCardProps) {
  const config = actionConfigs[type]

  if (!config) {
    return null
  }

  const Icon = config.icon
  const viewHref = config.href?.(data)

  const formatValue = (key: string, value: unknown): string => {
    if (value === null || value === undefined) return ""
    if (typeof value === "string") return value
    if (typeof value === "number") return value.toString()
    if (value instanceof Date) return value.toLocaleDateString()
    return JSON.stringify(value)
  }

  const getDisplayFields = (): { label: string; value: string }[] => {
    const fields: { label: string; value: string }[] = []

    switch (type) {
      case "ADD_CALENDAR_EVENT":
      case "UPDATE_CALENDAR_EVENT":
        if (data.title) fields.push({ label: "", value: formatValue("title", data.title) })
        if (data.date) fields.push({ label: "Date", value: formatDate(data.date as string) })
        if (data.time) fields.push({ label: "Time", value: formatValue("time", data.time) })
        if (data.clientName) fields.push({ label: "Client", value: formatValue("clientName", data.clientName) })
        break
      case "ADD_CLIENT":
      case "UPDATE_CLIENT":
        if (data.name || data.fullName) fields.push({ label: "", value: formatValue("name", data.name || data.fullName) })
        if (data.email) fields.push({ label: "Email", value: formatValue("email", data.email) })
        if (data.phone) fields.push({ label: "Phone", value: formatValue("phone", data.phone) })
        break
      case "ADD_HORSE":
      case "UPDATE_HORSE":
        if (data.name) fields.push({ label: "", value: formatValue("name", data.name) })
        if (data.breed) fields.push({ label: "Breed", value: formatValue("breed", data.breed) })
        if (data.ownerName) fields.push({ label: "Owner", value: formatValue("ownerName", data.ownerName) })
        break
      case "ASSIGN_STALL":
        if (data.horseName) fields.push({ label: "Horse", value: formatValue("horseName", data.horseName) })
        if (data.stallLabel) fields.push({ label: "Stall", value: formatValue("stallLabel", data.stallLabel) })
        break
      case "UPDATE_STAFF_STATUS":
      case "ADD_STAFF":
        if (data.staffName || data.fullName) fields.push({ label: "", value: formatValue("staffName", data.staffName || data.fullName) })
        if (data.status || data.statusDetail) fields.push({ label: "Status", value: formatValue("status", data.status || data.statusDetail) })
        break
      case "FIND_DOCUMENT":
      case "UPLOAD_DOCUMENT":
        if (data.documentName || data.name) fields.push({ label: "", value: formatValue("documentName", data.documentName || data.name) })
        if (data.documentType || data.category) fields.push({ label: "Type", value: formatValue("documentType", data.documentType || data.category) })
        break
      case "CREATE_TASK":
      case "UPDATE_TASK":
      case "COMPLETE_TASK":
        if (data.title) fields.push({ label: "", value: formatValue("title", data.title) })
        if (data.assignedTo || data.assigneeName) fields.push({ label: "Assigned", value: formatValue("assignedTo", data.assigneeName || data.assignedTo) })
        if (data.dueDate) fields.push({ label: "Due", value: formatDate(data.dueDate as string) })
        break
      case "CREATE_INVOICE":
      case "SEND_INVOICE":
      case "MARK_INVOICE_PAID":
        if (data.clientName) fields.push({ label: "", value: formatValue("clientName", data.clientName) })
        if (data.invoiceNumber) fields.push({ label: "Invoice #", value: formatValue("invoiceNumber", data.invoiceNumber) })
        if (data.amount || data.total) fields.push({ label: "Amount", value: formatCurrency(data.amount as number || data.total as number, data.currency as string) })
        break
      case "ADD_SERVICE":
        if (data.name) fields.push({ label: "", value: formatValue("name", data.name) })
        if (data.price) fields.push({ label: "Price", value: formatCurrency(data.price as number, data.currency as string) })
        break
      case "REMEMBER":
      case "RECALL":
      case "FORGET":
        if (data.key) fields.push({ label: "Key", value: formatValue("key", data.key) })
        if (data.value) fields.push({ label: "", value: formatValue("value", data.value) })
        break
      default:
        Object.entries(data).slice(0, 3).forEach(([key, value]) => {
          fields.push({ label: key, value: formatValue(key, value) })
        })
    }

    return fields
  }

  const displayFields = getDisplayFields()

  return (
    <div className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <Icon className={`h-4 w-4 ${config.textColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium ${config.textColor} uppercase tracking-wide`}>{config.title}</p>
          {displayFields.map((field, idx) => (
            <p key={idx} className="text-sm text-[var(--text-primary)] truncate">
              {field.label ? (
                <span>
                  <span className="text-[var(--text-muted)]">{field.label}:</span> {field.value}
                </span>
              ) : (
                <span className="font-medium">{field.value}</span>
              )}
            </p>
          ))}
        </div>
      </div>
      {(viewHref || onUndo) && (
        <div className="flex items-center gap-2 mt-3">
          {viewHref && (
            <Link
              href={viewHref}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] transition-colors"
            >
              View
            </Link>
          )}
          {onUndo && (
            <button
              onClick={onUndo}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Undo2 className="h-3 w-3" />
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// DISPLAY CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function DisplayCard({ type, data }: DisplayCardProps) {
  switch (type) {
    case "client_info":
      return <ClientInfoCard data={data as ClientInfo | ClientInfo[]} />
    case "horse_info":
      return <HorseInfoCard data={data as HorseInfo | HorseInfo[]} />
    case "documents":
      return <DocumentsCard data={data as DocumentInfo[]} />
    case "invoices":
      return <InvoicesCard data={data as InvoiceInfo[]} />
    case "tasks":
      return <TasksCard data={data as TaskInfo[]} />
    case "memories":
      return <MemoriesCard data={data as MemoryInfo[]} />
    case "balance":
      return <BalanceCard data={data as BalanceInfo} />
    case "events":
      return <EventsCard data={data as EventInfo[]} />
    case "staff":
      return <StaffCard data={data as StaffInfo | StaffInfo[]} />
    default:
      return null
  }
}

// ═══════════════════════════════════════════════════════════════════
// CLIENT INFO CARD
// ═══════════════════════════════════════════════════════════════════

function ClientInfoCard({ data }: { data: ClientInfo | ClientInfo[] }) {
  const clients = Array.isArray(data) ? data : [data]

  return (
    <div className="space-y-2">
      {clients.map((client) => (
        <div
          key={client.id}
          className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-green-500/10">
              <User className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--text-primary)] truncate">
                {client.fullName}
              </h3>
              <div className="mt-2 space-y-1">
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.horseNames && client.horseNames.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <HorseIcon className="h-3.5 w-3.5" />
                    <span>Horses: {client.horseNames.join(", ")}</span>
                  </div>
                )}
                {typeof client.outstanding === "number" && client.outstanding > 0 && (
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <Euro className="h-3.5 w-3.5" />
                    <span>Outstanding: {formatCurrency(client.outstanding, client.currency)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
            <Link
              href={`/clients/${client.id}`}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-page)] transition-colors"
            >
              View Profile
            </Link>
            {typeof client.outstanding === "number" && client.outstanding > 0 && (
              <Link
                href={`/billing?client=${client.id}`}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
              >
                Create Invoice
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// HORSE INFO CARD
// ═══════════════════════════════════════════════════════════════════

function HorseInfoCard({ data }: { data: HorseInfo | HorseInfo[] }) {
  const horses = Array.isArray(data) ? data : [data]

  return (
    <div className="space-y-2">
      {horses.map((horse) => {
        const age = horse.age ?? calculateAge(horse.dateOfBirth)
        return (
          <div
            key={horse.id}
            className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]"
          >
            <div className="flex items-start gap-3">
              {horse.photoUrl ? (
                <img
                  src={horse.photoUrl}
                  alt={horse.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <HorseIcon className="h-6 w-6 text-amber-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--text-primary)] truncate">
                  {horse.name}
                </h3>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  {horse.breed && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)]">
                      {horse.breed}
                    </span>
                  )}
                  {horse.color && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)]">
                      {horse.color}
                    </span>
                  )}
                  {age !== null && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)]">
                      {age} years
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  {horse.ownerName && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <User className="h-3.5 w-3.5" />
                      <span>Owner: {horse.ownerName}</span>
                    </div>
                  )}
                  {horse.stallLabel && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Stall: {horse.stallLabel}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
              <Link
                href={`/horses/${horse.id}`}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-page)] transition-colors"
              >
                View Profile
              </Link>
              <Link
                href={`/horses/${horse.id}#documents`}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Documents
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENTS CARD
// ═══════════════════════════════════════════════════════════════════

function DocumentsCard({ data }: { data: DocumentInfo[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-center text-[var(--text-muted)]">
        No documents found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((doc) => {
        const statusColors = getStatusColor(doc.status)
        return (
          <div
            key={doc.id}
            className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <FileText className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm text-[var(--text-primary)] truncate">
                    {doc.name}
                  </h4>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${statusColors.bg} ${statusColors.text}`}>
                    {doc.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">
                  {doc.category.replace(/_/g, " ")} • {doc.entityType}: {doc.entityName || "Unknown"}
                </div>
                {doc.expiryDate && (
                  <div className="mt-1 text-xs text-[var(--text-muted)]">
                    Expires: {formatDate(doc.expiryDate)}
                  </div>
                )}
              </div>
              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
                >
                  <Download className="h-4 w-4 text-[var(--text-muted)]" />
                </a>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// INVOICES CARD
// ═══════════════════════════════════════════════════════════════════

function InvoicesCard({ data }: { data: InvoiceInfo[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-center text-[var(--text-muted)]">
        No invoices found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((invoice) => {
        const statusColors = getStatusColor(invoice.status)
        return (
          <div
            key={invoice.id}
            className={`p-3 rounded-lg border ${statusColors.border} ${statusColors.bg}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${statusColors.bg}`}>
                  <Receipt className={`h-4 w-4 ${statusColors.text}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-[var(--text-primary)]">
                      #{invoice.invoiceNumber}
                    </h4>
                    <span className={`px-1.5 py-0.5 rounded text-xs uppercase ${statusColors.bg} ${statusColors.text}`}>
                      {invoice.status}
                    </span>
                  </div>
                  {invoice.clientName && (
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      {invoice.clientName}
                    </div>
                  )}
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    Issued: {formatDate(invoice.issuedDate)}
                    {invoice.dueDate && ` • Due: ${formatDate(invoice.dueDate)}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-[var(--text-primary)]">
                  {formatCurrency(invoice.total, invoice.currency)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--border)]">
              <Link
                href={`/billing?invoice=${invoice.id}`}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-page)] transition-colors"
              >
                View
              </Link>
              {invoice.status === "draft" && (
                <button className="px-3 py-1.5 rounded-md text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                  Send
                </button>
              )}
              {invoice.status === "sent" && (
                <button className="px-3 py-1.5 rounded-md text-xs font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors">
                  Mark Paid
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TASKS CARD
// ═══════════════════════════════════════════════════════════════════

function TasksCard({ data }: { data: TaskInfo[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-center text-[var(--text-muted)]">
        No tasks found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((task) => {
        const statusColors = getStatusColor(task.status)
        const priorityColors = getPriorityColor(task.priority)
        return (
          <div
            key={task.id}
            className={`p-3 rounded-lg border ${statusColors.border} bg-[var(--bg-elevated)]`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${statusColors.bg}`}>
                {task.status === "completed" ? (
                  <CheckCircle2 className={`h-4 w-4 ${statusColors.text}`} />
                ) : (
                  <CheckSquare className={`h-4 w-4 ${statusColors.text}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`font-medium text-sm ${task.status === "completed" ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}`}>
                    {task.title}
                  </h4>
                  <span className={`px-1.5 py-0.5 rounded text-xs uppercase ${priorityColors.bg} ${priorityColors.text}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[var(--text-muted)] space-y-0.5">
                  {task.assigneeName && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.assigneeName}
                    </div>
                  )}
                  {task.horseName && (
                    <div className="flex items-center gap-1">
                      <HorseIcon className="h-3 w-3" />
                      {task.horseName}
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due: {formatDate(task.dueDate)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MEMORIES CARD
// ═══════════════════════════════════════════════════════════════════

function MemoriesCard({ data }: { data: MemoryInfo[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-center text-[var(--text-muted)]">
        No memories found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((memory) => {
        const MemoryIcon = getMemoryTypeIcon(memory.memoryType)
        return (
          <div
            key={memory.id}
            className="p-3 rounded-lg border border-pink-500/30 bg-pink-500/5"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <MemoryIcon className="h-4 w-4 text-pink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-xs uppercase bg-pink-500/10 text-pink-400">
                    {memory.memoryType}
                  </span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {memory.key}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {memory.value}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// BALANCE CARD
// ═══════════════════════════════════════════════════════════════════

function BalanceCard({ data }: { data: BalanceInfo }) {
  const hasOutstanding = data.outstanding > 0

  return (
    <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]">
      {data.clientName && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[var(--border)]">
          <User className="h-4 w-4 text-[var(--text-muted)]" />
          <span className="font-medium text-[var(--text-primary)]">{data.clientName}</span>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Total</div>
          <div className="font-semibold text-[var(--text-primary)]">
            {formatCurrency(data.total, data.currency)}
          </div>
        </div>
        <div>
          <div className="text-xs text-green-400 uppercase tracking-wide mb-1">Paid</div>
          <div className="font-semibold text-green-400">
            {formatCurrency(data.paid, data.currency)}
          </div>
        </div>
        <div>
          <div className="text-xs text-amber-400 uppercase tracking-wide mb-1">Outstanding</div>
          <div className={`font-semibold ${hasOutstanding ? "text-amber-400" : "text-green-400"}`}>
            {formatCurrency(data.outstanding, data.currency)}
          </div>
        </div>
      </div>
      {(data.invoiceCount || data.pendingCount) && (
        <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)] text-center">
          {data.invoiceCount} invoices total
          {data.pendingCount && data.pendingCount > 0 && ` • ${data.pendingCount} pending`}
        </div>
      )}
      {hasOutstanding && data.clientId && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <Link
            href={`/billing?client=${data.clientId}`}
            className="block w-full text-center px-3 py-2 rounded-md text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
          >
            Create Invoice
          </Link>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// EVENTS CARD
// ═══════════════════════════════════════════════════════════════════

function EventsCard({ data }: { data: EventInfo[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-center text-[var(--text-muted)]">
        No events found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((event) => {
        const CategoryIcon = getEventCategoryIcon(event.category)
        return (
          <div
            key={event.id}
            className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CategoryIcon className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-[var(--text-primary)] truncate">
                  {event.title}
                </h4>
                <div className="mt-1 space-y-0.5 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {event.allDay ? (
                      <span>All day • {formatDate(event.startTime)}</span>
                    ) : (
                      <span>
                        {formatDate(event.startTime)} • {formatTime(event.startTime)}
                        {event.endTime && ` - ${formatTime(event.endTime)}`}
                      </span>
                    )}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                  {event.horseName && (
                    <div className="flex items-center gap-1">
                      <HorseIcon className="h-3 w-3" />
                      {event.horseName}
                    </div>
                  )}
                  {event.assignedStaff && event.assignedStaff.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.assignedStaff.map(s => s.fullName).join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// STAFF CARD
// ═══════════════════════════════════════════════════════════════════

function StaffCard({ data }: { data: StaffInfo | StaffInfo[] }) {
  const staffMembers = Array.isArray(data) ? data : [data]

  return (
    <div className="space-y-2">
      {staffMembers.map((staff) => {
        const statusColors = getStatusColor(staff.statusDetail || "working")
        return (
          <div
            key={staff.id}
            className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]"
          >
            <div className="flex items-start gap-3">
              {staff.avatarUrl ? (
                <img
                  src={staff.avatarUrl}
                  alt={staff.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="p-2 rounded-full bg-purple-500/10">
                  <User className="h-5 w-5 text-purple-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[var(--text-primary)] truncate">
                    {staff.fullName}
                  </h3>
                  {staff.statusDetail && (
                    <span className={`px-1.5 py-0.5 rounded text-xs ${statusColors.bg} ${statusColors.text}`}>
                      {staff.statusDetail}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                  {staff.role && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-surface)]">
                      {staff.role}
                    </span>
                  )}
                  {staff.contractType && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-surface)]">
                      {staff.contractType.replace("-", " ")}
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  {staff.email && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                  )}
                  {staff.phone && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{staff.phone}</span>
                    </div>
                  )}
                  {typeof staff.pendingTasksCount === "number" && (
                    <div className="flex items-center gap-2 text-sm text-amber-400">
                      <CheckSquare className="h-3.5 w-3.5" />
                      <span>{staff.pendingTasksCount} pending tasks</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
              <Link
                href={`/staff/${staff.id}`}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-page)] transition-colors"
              >
                View Profile
              </Link>
              <Link
                href={`/staff?assign=${staff.id}`}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
              >
                Assign Task
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
