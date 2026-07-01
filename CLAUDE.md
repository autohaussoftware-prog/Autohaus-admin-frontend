# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Build for production (Next.js standalone output)
npm run lint         # ESLint
npm run test         # Run all tests once (Vitest)
npm run test:watch   # Watch mode
npm run test:ui      # Vitest UI
npx vitest run src/__tests__/commission-logic.test.ts  # Run single test file
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # server-only, never expose to client
NEXT_PUBLIC_APP_URL
ANTHROPIC_API_KEY           # used for document capture (via direct fetch, not SDK)
```

## Architecture

### Request flow

Pages are React Server Components. They call `src/lib/data/*.ts` functions directly to fetch from Supabase. Mutations go through `src/app/actions/*.ts` (Next.js Server Actions with `"use server"`). Client components use `useActionState` / `useTransition` to call those actions.

### Supabase clients

Two clients, never mix them:
- `src/lib/supabase/server.ts` — `createClient()` uses the anon key + cookie session (respects RLS). Use for reads and user-scoped writes.
- `src/lib/supabase/admin.ts` — `getSupabaseAdminClient()` uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS). Use only for admin mutations inside Server Actions.

Both return `null` when env vars are absent; all callers must handle the null case.

### Data layer pattern

`src/lib/data/*.ts` files contain typed query functions. They return domain types (`Vehicle`, `Sale`, etc.), not raw DB rows. DB column names are snake_case; domain types are camelCase. Mapping happens inside these files.

### Permissions

Two layers:
1. **Route-level** — `src/lib/permissions.ts` `canAccessRoute(role, pathname)`. Used in middleware/layout to redirect unauthorized users.
2. **Action-level** — `src/lib/security.ts` exports `ROLES` sets and `requireRole(role, allowed)`. Every Server Action must check role before writing.

Role hierarchy (broadest → narrowest): `owner` → `partner` → `admin` → `gerente` → `accounting` → `advisor` → `viewer`. `inversionista` is a separate track with access only to `/mis-inversiones`.

### Domain logic

`src/lib/domain/` holds business calculations, never UI:
- `vehicle-calculations.ts` — profit, margin, invested capital
- `payment-channels-config.ts` — canonical payment channel list
- `vehicle-costs-config.ts` / `vehicle-docs-config.ts` — cost category and document definitions

### Validation

Zod schemas in `src/lib/schemas/`. `vehicleSchema` is the main one; it uses `isValidPlate()` from `src/lib/security.ts` (Colombian plate format: `ABC123`, `ABC1234`, `ABC123D`).

### Audit log

Call `logAudit()` from `src/lib/data/audit.ts` inside Server Actions whenever a sensitive record is mutated. It uses the admin client and silently no-ops if unconfigured.

### Supabase schema

Migrations are in `supabase/phase1–12_*.sql`. Main tables: `vehicles`, `sales`, `profiles`, `advisors`, `locations`, `commissions`, `finance_movements`, `audit_logs`. RLS policies in `supabase/rls_policies.sql`.

### Fallback to mock data

Some data functions fall back to `src/data/mock.ts` when Supabase is not configured. This was used during the initial visual-only phase and should be treated as legacy; new code should not add new mock fallbacks.

### Visual conventions

Dark theme, gold accent (`#C9A84C` / `amber` tokens). Components under `src/components/ui/` are minimal primitives (badge, button, card, input, select). All domain UI lives in `src/components/<domain>/`. No CSS Modules — Tailwind only.
