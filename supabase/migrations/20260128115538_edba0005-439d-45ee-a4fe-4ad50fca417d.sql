-- Block anonymous INSERT on ebook_leads
CREATE POLICY "block_anon_insert_ebook_leads"
ON public.ebook_leads FOR INSERT TO anon
WITH CHECK (false);

-- Block anonymous UPDATE on ebook_leads
CREATE POLICY "block_anon_update_ebook_leads"
ON public.ebook_leads FOR UPDATE TO anon
USING (false);

-- Block anonymous DELETE on ebook_leads
CREATE POLICY "block_anon_delete_ebook_leads"
ON public.ebook_leads FOR DELETE TO anon
USING (false);

-- Block authenticated (non-admin) INSERT on ebook_leads
CREATE POLICY "block_auth_insert_ebook_leads"
ON public.ebook_leads FOR INSERT TO authenticated
WITH CHECK (false);

-- Block authenticated (non-admin) UPDATE on ebook_leads
CREATE POLICY "block_auth_update_ebook_leads"
ON public.ebook_leads FOR UPDATE TO authenticated
USING (false);