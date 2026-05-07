create extension if not exists "pgcrypto";

create type public.user_role as enum (
  'super_admin',
  'ukssc_staff',
  'society_admin',
  'finance_reviewer',
  'student_member',
  'alumni',
  'sponsor'
);

create type public.account_type as enum ('student', 'alumni', 'sponsor', 'staff');
create type public.event_type as enum ('ukssc', 'society', 'cross_society');
create type public.forum_visibility as enum ('open_to_verified_users', 'membership_restricted');
create type public.claim_status as enum ('submitted', 'under_review', 'approved', 'rejected', 'paid');

create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  created_at timestamptz not null default now()
);

create table public.university_email_domains (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  domain text not null unique,
  created_at timestamptz not null default now()
);

create table public.societies (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id),
  name text not null,
  description text not null default '',
  logo_url text,
  status text not null default 'onboarding',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.user_role not null default 'student_member',
  account_type public.account_type not null default 'student',
  university_id uuid references public.universities(id),
  society_id uuid references public.societies(id),
  course text,
  study_year text,
  dietary_needs text,
  accessibility_needs text,
  emergency_event_contact text,
  verified boolean not null default false,
  consent_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  society_id uuid not null references public.societies(id) on delete cascade,
  membership_role text not null default 'member',
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  unique(profile_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  event_type public.event_type not null,
  location text not null,
  starts_at timestamptz not null,
  capacity integer not null check (capacity > 0),
  status text not null default 'open',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.event_societies (
  event_id uuid not null references public.events(id) on delete cascade,
  society_id uuid not null references public.societies(id) on delete cascade,
  primary key(event_id, society_id)
);

create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'confirmed',
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique(event_id, profile_id)
);

create table public.forum_boards (
  id uuid primary key default gen_random_uuid(),
  society_id uuid references public.societies(id) on delete cascade,
  name text not null,
  visibility public.forum_visibility not null,
  created_at timestamptz not null default now()
);

create table public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.forum_boards(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  title text not null,
  body text not null,
  pinned boolean not null default false,
  locked boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.reimbursement_claims (
  id uuid primary key default gen_random_uuid(),
  claimant_id uuid not null references public.profiles(id),
  society_id uuid not null references public.societies(id),
  amount numeric(10,2) not null check (amount > 0),
  purpose text not null,
  receipt_path text,
  status public.claim_status not null default 'submitted',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null,
  audience text not null,
  published_by uuid references public.profiles(id),
  published_at timestamptz not null default now()
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  consent_type text not null,
  accepted boolean not null,
  policy_version text not null,
  created_at timestamptz not null default now()
);

create table public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'submitted',
  notes text,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.report_exports (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references public.profiles(id),
  report_type text not null,
  filters jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.universities enable row level security;
alter table public.university_email_domains enable row level security;
alter table public.societies enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.events enable row level security;
alter table public.event_societies enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.forum_boards enable row level security;
alter table public.forum_threads enable row level security;
alter table public.forum_replies enable row level security;
alter table public.reimbursement_claims enable row level security;
alter table public.resources enable row level security;
alter table public.consent_records enable row level security;
alter table public.data_deletion_requests enable row level security;
alter table public.audit_logs enable row level security;
alter table public.report_exports enable row level security;

create or replace function public.current_profile_role()
returns public.user_role
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_profile_society_id()
returns uuid
language sql
security definer
stable
as $$
  select society_id from public.profiles where id = auth.uid()
$$;

create policy "verified users can read universities" on public.universities
  for select to authenticated using (true);

create policy "verified users can read domains" on public.university_email_domains
  for select to authenticated using (true);

create policy "verified users can read societies" on public.societies
  for select to authenticated using (true);

create policy "profiles read own or admin scoped" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.current_profile_role() in ('super_admin', 'ukssc_staff', 'finance_reviewer')
    or society_id = public.current_profile_society_id()
  );

create policy "profiles update own basic record" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "memberships read scoped" on public.memberships
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.current_profile_role() in ('super_admin', 'ukssc_staff')
    or society_id = public.current_profile_society_id()
  );

create policy "events read verified" on public.events
  for select to authenticated using (true);

create policy "rsvps own or admin scoped" on public.event_rsvps
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.current_profile_role() in ('super_admin', 'ukssc_staff')
  );

create policy "forum boards read by visibility" on public.forum_boards
  for select to authenticated
  using (
    visibility = 'open_to_verified_users'
    or society_id = public.current_profile_society_id()
    or public.current_profile_role() in ('super_admin', 'ukssc_staff')
  );

create policy "claims read finance or scoped" on public.reimbursement_claims
  for select to authenticated
  using (
    claimant_id = auth.uid()
    or public.current_profile_role() in ('super_admin', 'ukssc_staff', 'finance_reviewer')
    or society_id = public.current_profile_society_id()
  );

create policy "resources read verified" on public.resources
  for select to authenticated using (true);

create policy "consent own or ukssc" on public.consent_records
  for select to authenticated
  using (profile_id = auth.uid() or public.current_profile_role() in ('super_admin', 'ukssc_staff'));

create policy "deletion request own or ukssc" on public.data_deletion_requests
  for select to authenticated
  using (profile_id = auth.uid() or public.current_profile_role() in ('super_admin', 'ukssc_staff'));

create policy "audit ukssc only" on public.audit_logs
  for select to authenticated using (public.current_profile_role() in ('super_admin', 'ukssc_staff'));

create policy "reports ukssc only" on public.report_exports
  for select to authenticated using (public.current_profile_role() in ('super_admin', 'ukssc_staff'));
