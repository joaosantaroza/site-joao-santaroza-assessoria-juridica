
-- Create push_subscriptions table
CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Block all access for anon and authenticated
CREATE POLICY "block_anon_all_push_subscriptions" ON public.push_subscriptions
  AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "block_auth_all_push_subscriptions" ON public.push_subscriptions
  AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- Allow service_role to insert (via edge function)
CREATE POLICY "service_role_insert_push_subscriptions" ON public.push_subscriptions
  AS RESTRICTIVE FOR INSERT TO service_role WITH CHECK (true);

-- Allow service_role to select (for sending notifications)
CREATE POLICY "service_role_select_push_subscriptions" ON public.push_subscriptions
  AS RESTRICTIVE FOR SELECT TO service_role USING (true);

-- Allow service_role to delete
CREATE POLICY "service_role_delete_push_subscriptions" ON public.push_subscriptions
  AS RESTRICTIVE FOR DELETE TO service_role USING (true);

-- Admin can read
CREATE POLICY "admins_can_read_push_subscriptions" ON public.push_subscriptions
  AS RESTRICTIVE FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
