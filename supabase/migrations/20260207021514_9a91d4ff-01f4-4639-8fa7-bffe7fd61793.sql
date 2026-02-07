-- Fix ebook_leads security: Add explicit block for authenticated users on SELECT and DELETE
-- These are critical to prevent authenticated users from accessing PII data

-- 1. Add policy to block authenticated users from reading ebook leads
CREATE POLICY "block_auth_read_ebook_leads" ON public.ebook_leads
FOR SELECT TO authenticated
USING (false);

-- 2. Add policy to block authenticated users from deleting ebook leads
CREATE POLICY "block_auth_delete_ebook_leads" ON public.ebook_leads
FOR DELETE TO authenticated
USING (false);