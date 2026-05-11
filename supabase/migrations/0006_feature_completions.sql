-- ── Forum replies RLS ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "forum_replies_read" ON public.forum_replies;
CREATE POLICY "forum_replies_read" ON public.forum_replies
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "forum_replies_insert" ON public.forum_replies;
CREATE POLICY "forum_replies_insert" ON public.forum_replies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- ── Storage: receipts bucket ─────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "receipts_upload" ON storage.objects;
CREATE POLICY "receipts_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "receipts_read_own" ON storage.objects;
CREATE POLICY "receipts_read_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.current_profile_role() IN ('super_admin', 'ukssc_staff', 'finance_reviewer')
    )
  );

-- ── Admin can update member roles ─────────────────────────────────────────────

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.current_profile_role() IN ('super_admin', 'ukssc_staff'))
  WITH CHECK (public.current_profile_role() IN ('super_admin', 'ukssc_staff'));

-- ── Event RSVPs: admin can read all RSVPs for check-in ────────────────────────

DROP POLICY IF EXISTS "rsvps_own_or_admin_scoped" ON public.event_rsvps;
CREATE POLICY "rsvps_own_or_admin_scoped" ON public.event_rsvps
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR public.current_profile_role() IN ('super_admin', 'ukssc_staff')
    OR EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.event_societies es ON es.event_id = e.id
      WHERE e.id = event_rsvps.event_id
        AND es.society_id = public.current_profile_society_id()
    )
  );

DROP POLICY IF EXISTS "rsvps_checkin_update" ON public.event_rsvps;
CREATE POLICY "rsvps_checkin_update" ON public.event_rsvps
  FOR UPDATE TO authenticated
  USING (
    public.current_profile_role() IN ('super_admin', 'ukssc_staff', 'society_admin')
  );
