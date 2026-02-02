-- Block anonymous INSERT on admin_notifications
CREATE POLICY "block_anon_insert_admin_notifications"
ON public.admin_notifications
AS RESTRICTIVE
FOR INSERT
TO anon
WITH CHECK (false);

-- Block authenticated non-admin INSERT on admin_notifications  
CREATE POLICY "block_auth_insert_admin_notifications"
ON public.admin_notifications
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (false);