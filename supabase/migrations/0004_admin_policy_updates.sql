-- Allow privileged roles to manage member role/verification updates.
DROP POLICY IF EXISTS "profiles update admin managed fields" ON public.profiles;
CREATE POLICY "profiles update admin managed fields" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    public.current_profile_role() IN ('super_admin', 'ukssc_staff')
  )
  WITH CHECK (
    public.current_profile_role() IN ('super_admin', 'ukssc_staff')
  );

-- Restrict claim status updates to reviewer roles.
DROP POLICY IF EXISTS "claims_update_auth" ON public.reimbursement_claims;
CREATE POLICY "claims_update_auth" ON public.reimbursement_claims
  FOR UPDATE TO authenticated
  USING (
    public.current_profile_role() IN ('super_admin', 'ukssc_staff', 'finance_reviewer')
  )
  WITH CHECK (
    public.current_profile_role() IN ('super_admin', 'ukssc_staff', 'finance_reviewer')
  );
