/**
 * FILE: lib/mock/tasks.ts
 * ZONE: Yellow
 * PURPOSE: Mock task data for V1
 * EXPORTS: mockTasks
 * DEPENDS ON: lib/types.ts
 * CONSUMED BY: lib/mock/index.ts
 * TESTS: lib/mock/tasks.test.ts
 * LAST CHANGED: 2026-03-05 — Split from mock-data.ts
 */

import type { Task } from "@/lib/types"

// BREADCRUMB: Date helpers for generating relative dates
const today = new Date()
const formatDate = (date: Date): string => date.toISOString().split("T")[0]
const daysAgo = (days: number): string => {
  const d = new Date(today)
  d.setDate(d.getDate() - days)
  return formatDate(d)
}
const daysFromNow = (days: number): string => {
  const d = new Date(today)
  d.setDate(d.getDate() + days)
  return formatDate(d)
}

export const mockTasks: Task[] = [
  // 10 due today
  { id: "task-001", horseId: "horse-001", type: "feeding", title: "Morning feed", notes: "3 flakes hay, 1kg senior feed", dueDate: formatDate(today), completedAt: null, createdAt: daysAgo(1) },
  { id: "task-002", horseId: "horse-002", type: "medication", title: "Administer joint supplement", notes: "Mix with morning feed", dueDate: formatDate(today), completedAt: null, createdAt: daysAgo(1) },
  { id: "task-003", horseId: "horse-007", type: "medication", title: "Administer Bute", notes: "1g powder with feed - navicular management", dueDate: formatDate(today), completedAt: null, createdAt: daysAgo(2) },
  { id: "task-004", horseId: "horse-008", type: "feeding", title: "Soak hay for Sultan", notes: "30 minutes minimum - insulin resistant", dueDate: formatDate(today), completedAt: null, createdAt: daysAgo(1) },
  { id: "task-005", horseId: "horse-010", type: "medication", title: "Give omeprazole", notes: "Competition season ulcer prevention", dueDate: formatDate(today), completedAt: null, createdAt: daysAgo(3) },
  { id: "task-006", horseId: "horse-013", type: "other", title: "Check leg wraps", notes: "Scratches prevention - keep dry", dueDate: formatDate(today), completedAt: null, createdAt: daysAgo(1) },
  { id: "task-007", horseId: "horse-015", type: "feeding", title: "Evening feed", notes: "High energy ration + electrolytes", dueDate: formatDate(today), completedAt: null, createdAt: daysAgo(1) },
  { id: "task-008", horseId: "horse-021", type: "medication", title: "Feather mite treatment", notes: "Apply topical treatment to feathers", dueDate: formatDate(today), completedAt: null, createdAt: daysAgo(7) },
  { id: "task-009", horseId: "horse-023", type: "medication", title: "Give pergolide", notes: "Cushing's management - with morning feed", dueDate: formatDate(today), completedAt: null, createdAt: daysAgo(1) },
  { id: "task-010", horseId: "horse-005", type: "other", title: "Apply fly sheet", notes: "Sweet itch prevention", dueDate: formatDate(today), completedAt: null, createdAt: daysAgo(1) },
  // 8 due in next 7 days
  { id: "task-011", horseId: "horse-001", type: "farrier", title: "Farrier visit - trim front hooves", notes: "Scheduled with Marco the farrier", dueDate: daysFromNow(2), completedAt: null, createdAt: daysAgo(14) },
  { id: "task-012", horseId: "horse-004", type: "vet", title: "Annual vaccination", notes: "Flu/tetanus booster", dueDate: daysFromNow(3), completedAt: null, createdAt: daysAgo(30) },
  { id: "task-013", horseId: "horse-014", type: "vet", title: "Dental check", notes: "Annual float - senior horse", dueDate: daysFromNow(5), completedAt: null, createdAt: daysAgo(14) },
  { id: "task-014", horseId: "horse-006", type: "farrier", title: "Full shoeing", notes: "All four shoes", dueDate: daysFromNow(4), completedAt: null, createdAt: daysAgo(7) },
  { id: "task-015", horseId: "horse-011", type: "vet", title: "Deworming treatment", notes: "Quarterly schedule", dueDate: daysFromNow(6), completedAt: null, createdAt: daysAgo(10) },
  { id: "task-016", horseId: "horse-016", type: "other", title: "Clip coat", notes: "Hunter clip for competition", dueDate: daysFromNow(1), completedAt: null, createdAt: daysAgo(3) },
  { id: "task-017", horseId: "horse-019", type: "vet", title: "Follow-up check", notes: "Suspensory injury recovery assessment", dueDate: daysFromNow(7), completedAt: null, createdAt: daysAgo(21) },
  { id: "task-018", horseId: "horse-022", type: "farrier", title: "Trim all four", notes: "Young horse - regular maintenance", dueDate: daysFromNow(3), completedAt: null, createdAt: daysAgo(5) },
  // 7 already completed
  { id: "task-019", horseId: "horse-001", type: "feeding", title: "Morning feed", notes: "Completed on schedule", dueDate: daysAgo(1), completedAt: daysAgo(1) + "T07:30:00Z", createdAt: daysAgo(2) },
  { id: "task-020", horseId: "horse-003", type: "farrier", title: "Farrier visit - front trim", notes: "Young horse, feet growing fast", dueDate: daysAgo(3), completedAt: daysAgo(3) + "T10:00:00Z", createdAt: daysAgo(10) },
  { id: "task-021", horseId: "horse-009", type: "vet", title: "Annual vaccination", notes: "Flu/tetanus completed", dueDate: daysAgo(5), completedAt: daysAgo(5) + "T14:00:00Z", createdAt: daysAgo(20) },
  { id: "task-022", horseId: "horse-012", type: "medication", title: "Fly spray application", notes: "Natural spray for sensitive horse", dueDate: daysAgo(2), completedAt: daysAgo(2) + "T08:00:00Z", createdAt: daysAgo(3) },
  { id: "task-023", horseId: "horse-017", type: "other", title: "Mane pulling", notes: "Show prep", dueDate: daysAgo(4), completedAt: daysAgo(4) + "T16:00:00Z", createdAt: daysAgo(7) },
  { id: "task-024", horseId: "horse-020", type: "feeding", title: "Evening feed", notes: "Standard ration", dueDate: daysAgo(1), completedAt: daysAgo(1) + "T18:00:00Z", createdAt: daysAgo(2) },
  { id: "task-025", horseId: "horse-024", type: "vet", title: "Routine checkup", notes: "All clear", dueDate: daysAgo(7), completedAt: daysAgo(7) + "T11:00:00Z", createdAt: daysAgo(14) },
  // 5 overdue
  { id: "task-026", horseId: "horse-002", type: "farrier", title: "Farrier visit - corrective shoeing", notes: "Arthritis support - OVERDUE", dueDate: daysAgo(3), completedAt: null, createdAt: daysAgo(10) },
  { id: "task-027", horseId: "horse-008", type: "vet", title: "Blood test - insulin levels", notes: "Metabolic monitoring - OVERDUE", dueDate: daysAgo(5), completedAt: null, createdAt: daysAgo(20) },
  { id: "task-028", horseId: "horse-013", type: "medication", title: "Scratches treatment", notes: "Topical antifungal - OVERDUE", dueDate: daysAgo(2), completedAt: null, createdAt: daysAgo(5) },
  { id: "task-029", horseId: "horse-015", type: "vet", title: "EIPH scope check", notes: "Respiratory assessment - OVERDUE", dueDate: daysAgo(7), completedAt: null, createdAt: daysAgo(21) },
  { id: "task-030", horseId: "horse-025", type: "farrier", title: "Shoe reset", notes: "Front shoes loose - OVERDUE", dueDate: daysAgo(4), completedAt: null, createdAt: daysAgo(8) },
]
