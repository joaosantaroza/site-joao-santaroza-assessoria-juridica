-- Allow service_role to insert admin notifications (needed by scheduled edge functions)
CREATE POLICY "service_role_insert_admin_notifications"
ON public.admin_notifications
FOR INSERT
TO service_role
WITH CHECK (true);