-- Harden access to sensitive lead data by preventing direct client reads/deletes.
-- Admins will access this data through a secured backend function instead.

ALTER TABLE public.ebook_leads FORCE ROW LEVEL SECURITY;

-- Remove direct admin read/delete access via PostgREST. Keep deny-by-default for all client roles.
DROP POLICY IF EXISTS "Admins can read leads" ON public.ebook_leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON public.ebook_leads;
