# PLATFORM_OVERVIEW.md
# ⚠️ Cursor: READ THIS FIRST BEFORE EVERY PROMPT — NO EXCEPTIONS

## What VecHorses Is
SaaS platform for horse stable managers. Manages horses, clients (owners),
stalls, tasks, and billing. Dark professional UI. Web-first, mobile later.
Single source of truth for the stable — billing is handled by an external
freelancer service that writes directly to our database.

## Current Version: V1 (client-side only, mock data)
- V1 — Manager UI with mock data ← WE ARE HERE
- V2 — Supabase backend wired to manager UI [NOT STARTED]
- V3 — Horse owner portal + billing module [NOT STARTED]

## Module Map
modules/horses/    → Horse profiles, stall assignment, tasks, medical notes
modules/clients/   → Owner contact info, GDPR consent, linked horses
modules/stalls/    → Visual stall grid, occupancy, horse assignment
modules/billing/   → 🔴 RED ZONE — billing line items, freelancer integration
modules/dashboard/ → Reads from all modules via index.ts, daily overview
components/layout/ → Sidebar, TopHeader (shared across all pages)
components/ui/     → shadcn/ui re-exports and global primitives only
lib/               → types.ts, mock-data.ts, utils.ts

## Data Flow (V1)
lib/mock-data.ts → modules/*/hooks/ → modules/*/components/ → app/pages
V2 swap: replace hook internals only — component API stays identical

## Page Routes
/dashboard         → daily overview (horses, tasks, stalls, billing snapshot)
/horses            → list all horses
/horses/[id]       → horse detail
/horses/new        → add horse form
/horses/[id]/edit  → edit horse form
/clients           → list all clients
/clients/[id]      → client detail
/clients/new       → add client form
/clients/[id]/edit → edit client form
/stalls            → visual stall grid
/billing           → billing line items log
/settings          → placeholder for V2

## Key Integration: Billing Freelancer
Freelancer writes to billing_line_items table (Supabase, V2+)
We read and display in owner portal (V3)
Contract: { client_id, horse_id, description, amount_cents, currency, status, service_date }
NEVER change billing_line_items schema without telling the freelancer

## Zone Map
🟢 Green:  components/ui/, modules/*/components/, styles/
🟡 Yellow: modules/*/hooks/, modules/*/services/, lib/, app/api/
🔴 Red:    middleware.ts, lib/supabase.ts, modules/billing/, GDPR functions

## The 5 Things Cursor Must Never Do
1. Edit Red Zone files without asking the human first
2. Import from inside another module's subfolder (use index.ts only)
3. Use `any` type or invent field names
4. Write code without a PLAN block first
5. Say DONE before type-check, lint, and tests all pass

## File Summary Header Template (add to every new file)
/**
 * FILE: [path]
 * ZONE: [Green / Yellow / Red]
 * PURPOSE: [one sentence]
 * EXPORTS: [what this file exports]
 * DEPENDS ON: [imports]
 * CONSUMED BY: [what uses this]
 * TESTS: [test file path]
 * LAST CHANGED: [date] — [what and why]
 */
