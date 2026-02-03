-- Defense-in-depth hardening for sensitive lead PII table
-- Ensures public/anon/auth roles cannot access even if RLS were accidentally disabled.

ALTER TABLE public.ebook_leads ENABLE ROW LEVEL SECURITY;

-- Remove all direct table privileges from client-facing roles
REVOKE ALL PRIVILEGES ON TABLE public.ebook_leads FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public.ebook_leads FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.ebook_leads FROM authenticated;

-- Ensure backend service role retains required access
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ebook_leads TO service_role;