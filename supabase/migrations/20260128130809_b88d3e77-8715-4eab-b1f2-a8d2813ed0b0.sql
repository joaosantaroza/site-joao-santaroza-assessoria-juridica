-- Block authenticated non-admin users from reading ebook_leads
-- (Admins can still read via the existing 'Admins can read leads' policy)

CREATE POLICY "block_auth_read_ebook_leads"
ON public.ebook_leads
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (false);