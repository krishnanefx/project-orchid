-- ── Track 1: Finance / Claims ──────────────────────────────────────────────────

ALTER TABLE public.reimbursement_claims
  ADD COLUMN IF NOT EXISTS reviewer_notes text,
  ADD COLUMN IF NOT EXISTS budget_category text NOT NULL DEFAULT 'events',
  ADD COLUMN IF NOT EXISTS claimant_id_ref uuid; -- kept receipt_path from 0001; claimant_id already there

-- ── Track 2: Events / RSVP / Check-in ────────────────────────────────────────

-- event_rsvps already has checked_in_at; add a boolean for fast lookups
ALTER TABLE public.event_rsvps
  ADD COLUMN IF NOT EXISTS waitlisted boolean NOT NULL DEFAULT false;

-- ── Track 3: Member management ────────────────────────────────────────────────

ALTER TABLE public.memberships
  ADD COLUMN IF NOT EXISTS left_at timestamptz,
  ADD COLUMN IF NOT EXISTS notes text;

-- Widen status to support full lifecycle
-- (status is text, no enum constraint, so values can just be updated)
-- Valid values: active | pending_review | committee | suspended | left | alumni_conversion

-- ── Track 4: Storage-backed resources ────────────────────────────────────────

ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS file_path text;

-- ── Audit log: allow authenticated users to INSERT their own events ──────────

DROP POLICY IF EXISTS "audit_insert_auth" ON public.audit_logs;
CREATE POLICY "audit_insert_auth" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- ── Claim update policy: allow reviewer to add notes ─────────────────────────

DROP POLICY IF EXISTS "claims_update_reviewer" ON public.reimbursement_claims;
CREATE POLICY "claims_update_reviewer" ON public.reimbursement_claims
  FOR UPDATE TO authenticated
  USING (
    claimant_id = auth.uid()
    OR public.current_profile_role() IN ('super_admin', 'ukssc_staff', 'finance_reviewer')
  );

-- ── Memberships: allow admin to update any membership ─────────────────────────

DROP POLICY IF EXISTS "memberships_update_admin" ON public.memberships;
CREATE POLICY "memberships_update_admin" ON public.memberships
  FOR UPDATE TO authenticated
  USING (
    profile_id = auth.uid()
    OR public.current_profile_role() IN ('super_admin', 'ukssc_staff')
  );

-- ── Profiles: allow admin to update any profile role ─────────────────────────

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR public.current_profile_role() IN ('super_admin', 'ukssc_staff')
  );

-- ── RSVP check-in: allow event admin to mark checked_in_at ───────────────────

DROP POLICY IF EXISTS "event_rsvps_update_admin" ON public.event_rsvps;
CREATE POLICY "event_rsvps_update_admin" ON public.event_rsvps
  FOR UPDATE TO authenticated
  USING (
    profile_id = auth.uid()
    OR public.current_profile_role() IN ('super_admin', 'ukssc_staff', 'society_admin')
  );

-- ── Storage buckets (run these in Supabase Dashboard → Storage) ───────────────
-- CREATE BUCKET: 'receipts'  (private, 10 MB max file size)
-- CREATE BUCKET: 'resources' (public,  50 MB max file size)
--
-- Storage RLS for receipts bucket:
--   INSERT: auth.role() = 'authenticated'
--   SELECT: auth.role() = 'authenticated' AND (
--             (storage.foldername(name))[1] = auth.uid()::text
--             OR public.current_profile_role() IN ('super_admin','ukssc_staff','finance_reviewer')
--           )
--
-- Storage RLS for resources bucket:
--   INSERT: public.current_profile_role() IN ('super_admin','ukssc_staff')
--   SELECT: auth.role() = 'authenticated'
