-- Block anonymous access to ebook_leads table (contains customer PII: names, phones)
CREATE POLICY "block_anon_read_ebook_leads"
ON public.ebook_leads
FOR SELECT
TO anon
USING (false);

-- Block anonymous access to ebook_lead_rate_limits table (contains IP addresses)
CREATE POLICY "block_anon_read_ebook_lead_rate_limits"
ON public.ebook_lead_rate_limits
FOR SELECT
TO anon
USING (false);

-- Block anonymous access to tts_rate_limits table (contains IP addresses)
CREATE POLICY "block_anon_read_tts_rate_limits"
ON public.tts_rate_limits
FOR SELECT
TO anon
USING (false);