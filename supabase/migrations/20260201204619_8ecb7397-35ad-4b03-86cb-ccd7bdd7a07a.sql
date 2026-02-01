-- Fix: allow admins to read ebook leads by removing restrictive policy that blocks all authenticated SELECT
-- RLS remains enabled; access is still limited to authenticated admins via existing policy "Admins can read leads".

BEGIN;

DROP POLICY IF EXISTS "block_auth_read_ebook_leads" ON public.ebook_leads;

COMMIT;