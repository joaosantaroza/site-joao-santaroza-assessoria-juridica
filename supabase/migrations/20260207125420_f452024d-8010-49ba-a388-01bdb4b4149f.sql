-- Add admin-only read policy for ebook_leads table
-- This completes the security posture by explicitly allowing only admins to read lead data

-- First, add the admin read policy
CREATE POLICY "Admins can read ebook leads"
ON public.ebook_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));