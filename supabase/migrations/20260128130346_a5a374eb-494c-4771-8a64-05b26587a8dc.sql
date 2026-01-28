-- Block authenticated users from reading rate-limit records
-- (Anonymous users are already blocked; service role bypasses RLS for backend operations.)

CREATE POLICY "block_auth_read_ebook_lead_rate_limits"
ON public.ebook_lead_rate_limits
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (false);
