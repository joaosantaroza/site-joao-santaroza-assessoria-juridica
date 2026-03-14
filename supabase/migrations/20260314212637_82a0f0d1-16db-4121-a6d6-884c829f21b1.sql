
-- Fix: Change service_role_insert_follow_ups from {public} to {service_role}
DROP POLICY IF EXISTS "service_role_insert_follow_ups" ON public.follow_ups;
CREATE POLICY "service_role_insert_follow_ups"
  ON public.follow_ups
  FOR INSERT
  TO service_role
  WITH CHECK (true);
