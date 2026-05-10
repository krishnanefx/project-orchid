-- Forum threads: read + write
DROP POLICY IF EXISTS "forum_threads_read" ON public.forum_threads;
CREATE POLICY "forum_threads_read" ON public.forum_threads
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "forum_threads_insert" ON public.forum_threads;
CREATE POLICY "forum_threads_insert" ON public.forum_threads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- Memberships: insert own + update own
DROP POLICY IF EXISTS "memberships_insert_own" ON public.memberships;
CREATE POLICY "memberships_insert_own" ON public.memberships
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "memberships_update_own" ON public.memberships;
CREATE POLICY "memberships_update_own" ON public.memberships
  FOR UPDATE TO authenticated USING (auth.uid() = profile_id);

-- Event RSVPs: insert + delete own
DROP POLICY IF EXISTS "event_rsvps_insert_own" ON public.event_rsvps;
CREATE POLICY "event_rsvps_insert_own" ON public.event_rsvps
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "event_rsvps_delete_own" ON public.event_rsvps;
CREATE POLICY "event_rsvps_delete_own" ON public.event_rsvps
  FOR DELETE TO authenticated USING (auth.uid() = profile_id);
