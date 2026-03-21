
-- Fix 1: Add RESTRICTIVE policy blocking authenticated non-admin reads on tts_rate_limits
CREATE POLICY "block_authenticated_read_tts_rate_limits"
  ON public.tts_rate_limits
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Add RESTRICTIVE insert policy on user_roles as defense-in-depth
CREATE POLICY "restrictive_admin_only_insert_user_roles"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
