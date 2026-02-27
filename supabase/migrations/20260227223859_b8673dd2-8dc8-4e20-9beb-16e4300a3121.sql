
-- Create appointments table
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  practice_area text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Deny all for anon
CREATE POLICY "block_anon_all_appointments"
  ON public.appointments FOR ALL TO anon
  USING (false) WITH CHECK (false);

-- Deny read/update/delete for regular authenticated users
CREATE POLICY "block_auth_select_appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (false);

CREATE POLICY "block_auth_update_appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "block_auth_delete_appointments"
  ON public.appointments FOR DELETE TO authenticated
  USING (false);

CREATE POLICY "block_auth_insert_appointments"
  ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (false);

-- Admin policies (PERMISSIVE to override restrictive blocks)
CREATE POLICY "Admins can read appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete appointments"
  ON public.appointments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- service_role insert (for edge function)
CREATE POLICY "service_role_insert_appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

-- Revoke direct access for anon and authenticated
REVOKE ALL ON public.appointments FROM anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.appointments TO authenticated;

-- Rate limit table for appointments
CREATE TABLE public.appointment_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(ip_address, window_start)
);

ALTER TABLE public.appointment_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "block_all_appointment_rate_limits"
  ON public.appointment_rate_limits FOR ALL
  USING (false) WITH CHECK (false);

REVOKE ALL ON public.appointment_rate_limits FROM anon, authenticated;

-- Rate limit function
CREATE OR REPLACE FUNCTION public.check_appointment_rate_limit(
  p_ip_address text,
  p_max_requests integer DEFAULT 3,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count INT;
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := date_trunc('hour', NOW()) +
    (EXTRACT(MINUTE FROM NOW())::INT / p_window_minutes) * (p_window_minutes || ' minutes')::INTERVAL;

  INSERT INTO public.appointment_rate_limits (ip_address, request_count, window_start, updated_at)
  VALUES (p_ip_address, 1, v_window_start, NOW())
  ON CONFLICT (ip_address, window_start)
  DO UPDATE SET
    request_count = appointment_rate_limits.request_count + 1,
    updated_at = NOW()
  RETURNING request_count INTO v_current_count;

  RETURN v_current_count <= p_max_requests;
END;
$$;
