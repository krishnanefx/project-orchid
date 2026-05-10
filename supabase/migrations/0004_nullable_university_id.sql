-- university_id on societies is not practically useful because the app
-- uses university_slug (matching the static client-side list) for all
-- display logic. Drop the NOT NULL constraint so new societies can be
-- inserted without fabricating a fake UUID.
ALTER TABLE public.societies ALTER COLUMN university_id DROP NOT NULL;
