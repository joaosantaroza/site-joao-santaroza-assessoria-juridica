
-- Create follow_ups table
CREATE TABLE public.follow_ups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_type text NOT NULL,
  lead_id uuid NOT NULL,
  lead_name text NOT NULL,
  lead_phone text NOT NULL,
  practice_area text NOT NULL,
  follow_up_date date NOT NULL,
  sequence_step integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can read follow_ups" ON public.follow_ups FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update follow_ups" ON public.follow_ups FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete follow_ups" ON public.follow_ups FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert (from edge functions)
CREATE POLICY "service_role_insert_follow_ups" ON public.follow_ups FOR INSERT WITH CHECK (true);

-- Block anon and regular authenticated users
CREATE POLICY "block_anon_all_follow_ups" ON public.follow_ups FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "block_auth_insert_follow_ups" ON public.follow_ups FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
