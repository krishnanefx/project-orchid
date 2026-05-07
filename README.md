# Project Orchid

Project Orchid is a production-oriented Next.js app for UKSSC's Singaporean student society ecosystem.

## Stack

- Next.js App Router
- React
- Supabase Auth/Postgres/Storage-ready client helpers
- Supabase SQL migration with RLS foundations
- Vercel-ready configuration

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/migrations/0001_project_orchid.sql`.
3. Create a private storage bucket for reimbursement receipts.
4. Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The current UI uses seeded local data while the schema and client helpers are ready for Supabase integration.

## Verification

```bash
npm run typecheck
npm run build
node scripts/verify-ui.mjs
```

The verification script expects the dev server to be running at `http://127.0.0.1:3000`.
