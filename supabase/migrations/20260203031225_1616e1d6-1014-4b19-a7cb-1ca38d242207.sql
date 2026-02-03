-- Add explicit service-role policies so backend functions can insert records without weakening public access.
-- This keeps client access blocked while removing false-positive scanner complaints.

-- ebook_leads: allow inserts only for service_role
DROP POLICY IF EXISTS "service_role_insert_ebook_leads" ON public.ebook_leads;
CREATE POLICY "service_role_insert_ebook_leads"
ON public.ebook_leads
FOR INSERT
TO service_role
WITH CHECK (true);

-- ebook_lead_rate_limits: allow upserts for service_role (INSERT + UPDATE)
DROP POLICY IF EXISTS "service_role_insert_ebook_lead_rate_limits" ON public.ebook_lead_rate_limits;
CREATE POLICY "service_role_insert_ebook_lead_rate_limits"
ON public.ebook_lead_rate_limits
FOR INSERT
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_update_ebook_lead_rate_limits" ON public.ebook_lead_rate_limits;
CREATE POLICY "service_role_update_ebook_lead_rate_limits"
ON public.ebook_lead_rate_limits
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- tts_rate_limits: allow upserts for service_role (INSERT + UPDATE)
DROP POLICY IF EXISTS "service_role_insert_tts_rate_limits" ON public.tts_rate_limits;
CREATE POLICY "service_role_insert_tts_rate_limits"
ON public.tts_rate_limits
FOR INSERT
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_update_tts_rate_limits" ON public.tts_rate_limits;
CREATE POLICY "service_role_update_tts_rate_limits"
ON public.tts_rate_limits
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);
