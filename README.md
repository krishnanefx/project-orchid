# Project Orchid

A centralised digital platform for UK-based Singaporean students, operated by the **UK Singapore Students' Council (UKSSC)**. It unifies society membership, event discovery, peer forums, reimbursement workflows, and admin oversight in a single product.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Auth & Database | Supabase (PostgreSQL + Row Level Security) |
| Storage | Supabase Storage (receipts bucket, resources bucket) |
| Styling | Custom "Stitch" design system (CSS variables + utility classes) |
| Icons | Phosphor Icons |
| Validation | Zod |
| Hosting | Vercel |

## Features

- **Verified profiles** — university email matching, course/year, dietary & accessibility preferences
- **Society hubs** — per-society pages with committee info, gallery, bio, and links; admins can edit from the dashboard
- **Event calendar** — RSVP, waitlist, and live check-in panel for society admins
- **Forums** — threaded discussion boards with per-thread reply composer; board-level visibility controls
- **Reimbursement portal** — claim submission with receipt upload to Supabase Storage, reviewer approval panel, budget categories, CSV export
- **Member management** — membership status lifecycle (active → committee → alumni), platform role assignment, admin notes
- **Admin data panel** — create/edit societies, events, resources, forum boards; global members view with search and role management
- **Audit log** — every role change, claim review, and membership update is recorded
- **Permission matrix** — per-role feature flags editable by super admins at runtime
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

Open `http://localhost:3000`. The app loads with the authenticated user's data from Supabase. Set up a local Supabase project or point to your hosted project via env vars.

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # used for password reset redirect
```

## Database Setup

Run migrations in order against your Supabase project via **Dashboard → SQL Editor**:

| File | Purpose |
|---|---|
| `0001_project_orchid.sql` | Core schema: profiles, societies, events, forum boards/threads, reimbursement claims, memberships, resources |
| `0002_extend_for_app.sql` | Extended columns, helper functions (`current_profile_role`, `current_profile_society_id`) |
| `0003_fix_trigger_backfill.sql` | Profile insert trigger fix and backfill |
| `0004_nullable_university_id.sql` | Relax university_id constraint for staff accounts |
| `0005_write_policies.sql` | Full RLS write policies across all tables |
| `0006_feature_completions.sql` | Forum replies RLS; receipts storage bucket and policies; RSVP read/check-in policies |
| `0007_product_tracks.sql` | Adds `reviewer_notes`, `budget_category`, `waitlisted`, `left_at`, `notes`, `file_path` columns; claim/membership/profile update policies; audit log insert policy |

### Storage Buckets

Create these two buckets in **Supabase Dashboard → Storage**:

| Bucket | Visibility | Use |
|---|---|---|
| `receipts` | Private | Reimbursement receipt files, scoped to uploader's UID path |
| `resources` | Public | Staff-uploaded guides and announcements |

RLS policies for both buckets are documented in `0007_product_tracks.sql`.

## Verification

```bash
npm run typecheck   # tsc --noEmit
npm run build       # production build check
```

## Project Structure

```
app/
  api/
    auth/           # Supabase Auth callback
    events/checkin/ # Check-in API route
    storage/        # Receipt and resource upload routes
  page.tsx          # Entry point — redirects to /dashboard or /login
  dashboard/        # Authenticated app shell

components/
  layout/           # Sidebar, top bar
  views/            # One file per major view (dashboard, forums, claims, etc.)
  ui/               # Shared primitives (PageHeader, etc.)

lib/
  actions.ts        # All Server Actions (DB reads/writes)
  app-context.tsx   # Global React context (view state, current user, local data)
  permissions.ts    # Feature flag matrix and ROLE_DISPLAY map
  types.ts          # All TypeScript types
  data.ts           # Static seed data (universities)
  utils.ts          # CSV export helper

supabase/
  migrations/       # Ordered SQL migration files
```
