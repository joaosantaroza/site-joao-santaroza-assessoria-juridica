-- Block anonymous INSERT on rate limit tables
CREATE POLICY "block_anon_insert_tts_rate_limits"
ON public.tts_rate_limits FOR INSERT TO anon
WITH CHECK (false);

CREATE POLICY "block_anon_insert_ebook_lead_rate_limits"
ON public.ebook_lead_rate_limits FOR INSERT TO anon
WITH CHECK (false);

-- Block anonymous UPDATE on rate limit tables
CREATE POLICY "block_anon_update_tts_rate_limits"
ON public.tts_rate_limits FOR UPDATE TO anon
USING (false);

CREATE POLICY "block_anon_update_ebook_lead_rate_limits"
ON public.ebook_lead_rate_limits FOR UPDATE TO anon
USING (false);

-- Block anonymous DELETE on rate limit tables
CREATE POLICY "block_anon_delete_tts_rate_limits"
ON public.tts_rate_limits FOR DELETE TO anon
USING (false);

CREATE POLICY "block_anon_delete_ebook_lead_rate_limits"
ON public.ebook_lead_rate_limits FOR DELETE TO anon
USING (false);

-- Block authenticated INSERT/UPDATE/DELETE on rate limit tables (only service role should access)
CREATE POLICY "block_auth_insert_tts_rate_limits"
ON public.tts_rate_limits FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "block_auth_insert_ebook_lead_rate_limits"
ON public.ebook_lead_rate_limits FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "block_auth_update_tts_rate_limits"
ON public.tts_rate_limits FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "block_auth_update_ebook_lead_rate_limits"
ON public.ebook_lead_rate_limits FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "block_auth_delete_tts_rate_limits"
ON public.tts_rate_limits FOR DELETE TO authenticated
USING (false);

CREATE POLICY "block_auth_delete_ebook_lead_rate_limits"
ON public.ebook_lead_rate_limits FOR DELETE TO authenticated
USING (false);