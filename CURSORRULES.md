# VECHORSES Engineering Standards v1.0

> **READ PLATFORM_OVERVIEW.md FIRST. ALWAYS. NO EXCEPTIONS.**

## MANDATORY FIRST STEP
Before ANY prompt — read PLATFORM_OVERVIEW.md in full.
Then read the summary header of every file you will touch.
Then output your PLAN before writing a single line of code.

## PLAN MODE FORMAT (required before every coding task)
```
PLAN: [what I am building]
FILES I WILL TOUCH: [list with zone — Green/Yellow/Red]
FILES I WILL CREATE: [list]
RISK: [what could break]
INTEGRATION POINTS: [which modules connect here]
TEST PLAN: [what tests I will write]
THEN I WILL: [verification steps after coding]
```

## NEVER GUESS
If you don't know a type, prop, DB field, or integration shape — STOP and ask.
Never use `any`. Never invent field names. Never assume API shapes.

## ZONE RULES
| Zone | Scope | Action |
|------|-------|--------|
| 🟢 Green | components/ui, display components | Edit freely |
| 🟡 Yellow | hooks, services, lib, api routes | Edit with review note |
| 🔴 Red | middleware, supabase, billing, GDPR | STOP — ask human before editing |

## FILE RULES
- Max ~150 lines per file. Split if longer.
- Max ~50 lines per function. Extract if longer.
- One component per file. One hook per file.
- Every file starts with the summary header block
- Modules only import from another module's index.ts — never from subfolders

## DIRECTORY STRUCTURE
```
modules/{feature}/{components,hooks,services,tests,index.ts}
lib/{types.ts, mock-data.ts, utils.ts}
components/{ui/, layout/}
scripts/smart-test.sh
```

## BREADCRUMBS
Every non-trivial logic block gets a BREADCRUMB comment:
```typescript
// BREADCRUMB: [why this exists, what breaks if removed, who calls this]
```

## AUTO-LOOP (run automatically after every coding task)
1. `npm run type-check` → fix all errors
2. `npm run lint` → fix all errors
3. `npm run test:changed` → fix failures (max 3 attempts)
4. `npm run test:integration` → verify
5. Say DONE when all 4 are green

## PRE-FINISH CHECKLIST
- [ ] type-check passes
- [ ] lint passes
- [ ] unit tests written
- [ ] integration test written
- [ ] breadcrumbs added
- [ ] file summary headers added
- [ ] no file > ~150 lines
- [ ] no cross-module deep imports
- [ ] PLATFORM_OVERVIEW.md updated if architecture changed

## STACK
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Data (V1) | mock data from lib/mock-data.ts |
| Data (V2+) | Supabase (@supabase/supabase-js, @supabase/auth-helpers-nextjs) |
| Forms | react-hook-form + zod |
| Tests | Jest + React Testing Library |

## THEME
```
Dark theme:
- Background: #0F1117
- Surface: #1A1A2E
- Accent: #2C5F2E
```

## BILLING MODULE (Red Zone — isolated)
- ALL billing in `modules/billing/` only
- Single hook: `useBillingForOwner(clientId)`
- Freelancer integration: they write to billing_line_items, we read
- Never pass PII to billing module — client_id only
- Never edit billing module without human approval
