-- Extend societies with columns the app uses
ALTER TABLE public.societies
  ADD COLUMN IF NOT EXISTS logo text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS committee text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS links text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS members INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS founded_year INTEGER,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS banner_color text,
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}',
  -- Short slug matching the static university list (e.g. 'ucl', 'imperial')
  ADD COLUMN IF NOT EXISTS university_slug text NOT NULL DEFAULT '';

-- Extend events with denormalised columns the app reads directly
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS rsvps INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS checked_in INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS society_ids text[] NOT NULL DEFAULT '{}';

-- Extend forum_boards with cached counters and moderation fields
ALTER TABLE public.forum_boards
  ADD COLUMN IF NOT EXISTS pinned text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS threads INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS replies INTEGER NOT NULL DEFAULT 0;

-- Extend reimbursement_claims with display fields
ALTER TABLE public.reimbursement_claims
  ADD COLUMN IF NOT EXISTS claimant text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS receipt_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS submitted_at DATE;

-- Back-fill submitted_at from created_at
UPDATE public.reimbursement_claims
  SET submitted_at = created_at::date
  WHERE submitted_at IS NULL;

-- ── Write policies (select policies exist in 0001) ──────────────────────────

DROP POLICY IF EXISTS "societies_insert_auth" ON public.societies;
CREATE POLICY "societies_insert_auth" ON public.societies
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "societies_update_auth" ON public.societies;
CREATE POLICY "societies_update_auth" ON public.societies
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "events_insert_auth" ON public.events;
CREATE POLICY "events_insert_auth" ON public.events
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "events_update_auth" ON public.events;
CREATE POLICY "events_update_auth" ON public.events
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "forum_boards_insert_auth" ON public.forum_boards;
CREATE POLICY "forum_boards_insert_auth" ON public.forum_boards
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "resources_insert_auth" ON public.resources;
CREATE POLICY "resources_insert_auth" ON public.resources
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "claims_insert_auth" ON public.reimbursement_claims;
CREATE POLICY "claims_insert_auth" ON public.reimbursement_claims
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "claims_update_auth" ON public.reimbursement_claims;
CREATE POLICY "claims_update_auth" ON public.reimbursement_claims
  FOR UPDATE TO authenticated USING (true);

-- ── Auto-create profile row when a user signs up ────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
