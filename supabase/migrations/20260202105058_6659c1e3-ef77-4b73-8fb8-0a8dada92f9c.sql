-- Fix: Convert admin read policy to PERMISSIVE so admins can actually access ebook leads
-- The current RESTRICTIVE policy conflicts with other RESTRICTIVE policies that return false

BEGIN;

-- Drop the current RESTRICTIVE admin policy
DROP POLICY IF EXISTS "Admins can read leads" ON public.ebook_leads;

-- Create a PERMISSIVE policy for admins to read leads
-- PERMISSIVE policies allow access if ANY permissive policy passes
CREATE POLICY "Admins can read leads"
ON public.ebook_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- The block_anon_read_ebook_leads policy targets anon role implicitly
-- We need to ensure the blocking policy only affects anon users, not authenticated admins
-- Drop and recreate with explicit role targeting
DROP POLICY IF EXISTS "block_anon_read_ebook_leads" ON public.ebook_leads;

-- Create restrictive block for anon role only
CREATE POLICY "block_anon_read_ebook_leads"
ON public.ebook_leads
FOR SELECT
TO anon
USING (false);

COMMIT;