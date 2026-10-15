# Project Orchid

A centralised digital platform for UK-based Singaporean students, operated by the **UK Singapore Students' Council (UKSSC)**. It unifies society membership, event discovery, peer forums, reimbursement workflows, and admin oversight in a single product.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Auth & Database | Supabase (PostgreSQL + Row Level Security) |
| Storage | Supabase Storage (receipts bucket, resources bucket) |
| Styling | Custom "Stitch" design system (CSS variables in `app/globals.css`); Tailwind CSS for the marketing pages |
| Icons | Phosphor Icons |
| Validation | Zod |
| Testing | Vitest + Testing Library |
| Hosting | Vercel |

## Features

- **Verified profiles** — university email matching, course/year, dietary & accessibility preferences
- **Society hubs** — per-society pages with committee info, gallery, bio, and links; admins can edit from the dashboard
- **Event calendar** — RSVP, waitlist, QR tickets, and a live check-in panel for society admins
- **Forums** — threaded discussion boards with per-thread reply composer; board-level visibility controls
- **Reimbursement portal** — claim submission with receipt upload to Supabase Storage, reviewer approval panel, budget categories, CSV export
- **Member management** — membership status lifecycle (active → committee → alumni), platform role assignment, admin notes
- **Admin data panel** — create/edit societies, events, resources, forum boards; global members view with search and role management
- **Audit log** — every role change, claim review, and membership update is recorded
- **Permission matrix** — per-role feature flags that super admins can toggle in the Access Control view (held in client state for the session; not yet persisted)
- **Password reset** — email-triggered reset flow via Supabase Auth

## Roles

| Role | Access |
|---|---|
| `super_admin` | Full access to everything, bypasses all permission checks |
| `ukssc_staff` | Admin panel, all society data, claim review, member management |
| `society_admin` | Own society hub, events, member list, check-in |
| `finance_reviewer` | Claims review and approval |
| `student_member` | Events, forums, society join, own claims |
| `alumni` | Read-only events and forums |
| `sponsor` | Limited read access |

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the landing page; sign in at `/login` to reach `/dashboard`. Point the app at a Supabase project via the env vars below. If the Supabase vars are unset, `middleware.ts` skips session handling and route protection, so only the public pages are useful.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | App, middleware, tests |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | App, middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | Only the RLS integration tests (`tests/rls.test.ts`); never expose it to the client |
| `NEXT_PUBLIC_SITE_URL` | Redirect base for `sendPasswordResetAction` (not in `.env.example`; add it, e.g. `http://localhost:3000`) |

## Database Setup

Run migrations in order against your Supabase project via **Dashboard → SQL Editor**:

| File | Purpose |
|---|---|
| `0001_project_orchid.sql` | Core schema: profiles, societies, events, forum boards/threads, reimbursement claims, memberships, resources |
| `0002_extend_for_app.sql` | Extended columns, helper functions (`current_profile_role`, `current_profile_society_id`) |
| `0003_fix_trigger_backfill.sql` | Profile insert trigger fix and backfill |
| `0004_admin_policy_updates.sql` | Lets privileged roles update member role/verification fields |
| `0004_nullable_university_id.sql` | Relax university_id constraint for staff accounts |
| `0005_write_policies.sql` | Full RLS write policies across all tables |
| `0006_feature_completions.sql` | Forum replies RLS; receipts storage bucket and policies; RSVP read/check-in policies |
| `0007_product_tracks.sql` | Adds `reviewer_notes`, `budget_category`, `waitlisted`, `left_at`, `notes`, `file_path` columns; claim/membership/profile update policies; audit log insert policy |

### Storage Buckets

`0006_feature_completions.sql` creates the `receipts` bucket and its policies. Create `resources` (and `receipts`, if the migration couldn't) in **Supabase Dashboard → Storage**:

| Bucket | Visibility | Use |
|---|---|---|
| `receipts` | Private | Reimbursement receipt files, scoped to uploader's UID path |
| `resources` | Public | Staff-uploaded guides and announcements |

Size limits and storage RLS for both buckets are listed in the comments at the end of `0007_product_tracks.sql`.

## Verification

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm test            # vitest run
npm run build       # production build check
```

`tests/rls.test.ts` exercises the RLS policies against a real Supabase project and skips itself unless `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and the per-role test-user credentials are set (see the header of that file).

`scripts/verify-ui.mjs` is a Playwright smoke check that screenshots the running app at `http://127.0.0.1:3000` (start `npm run dev` first, then `node scripts/verify-ui.mjs`).

## Project Structure

```
app/
  (marketing)/      # Public pages: landing (/), login, register, forgot/reset password
  (app)/dashboard/  # Authenticated app shell
  api/
    auth/           # Supabase Auth callback + sign-out
    events/checkin/ # Check-in API route
    storage/        # Receipt and resource upload routes
middleware.ts       # Session refresh; guards /dashboard, bounces signed-in users off /login and /register

components/
  orchid-app.tsx    # Client app shell that switches between views
  layout/           # Sidebar, top bar
  marketing/        # Landing-page header
  views/            # One file per major view (dashboard, forums, claims, etc.)
  ui/               # Shared primitives, ticket modal

lib/
  actions.ts        # Server Actions (mutations, uploads, password reset)
  orchid-service.ts # Supabase queries + row → type mappers
  supabase.ts / supabase-server.ts  # Browser and server Supabase clients
  app-context.tsx   # Global React context (view state, current user, local data)
  permissions.ts    # Feature flag matrix and ROLE_DISPLAY map
  types.ts          # All TypeScript types
  data.ts           # Static seed data (universities)
  utils.ts          # CSV and .ics export helpers

supabase/
  migrations/       # Ordered SQL migration files

tests/              # Vitest unit tests + RLS integration tests
docs/product-brief.md
```
