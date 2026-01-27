-- Add validation constraints to ebook_leads table
ALTER TABLE public.ebook_leads 
ADD CONSTRAINT valid_phone CHECK (length(phone) >= 10 AND length(phone) <= 20),
ADD CONSTRAINT valid_name CHECK (length(name) >= 2 AND length(name) <= 100),
ADD CONSTRAINT valid_ebook_id CHECK (length(ebook_id) >= 1 AND length(ebook_id) <= 100),
ADD CONSTRAINT valid_ebook_title CHECK (length(ebook_title) >= 1 AND length(ebook_title) <= 200);

-- Create rate limit table for ebook leads
CREATE TABLE IF NOT EXISTS public.ebook_lead_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (ip_address, window_start)
);

-- Enable RLS on rate limits table (no public access - only via SECURITY DEFINER function)
ALTER TABLE public.ebook_lead_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create function to check and update rate limit for ebook leads
CREATE OR REPLACE FUNCTION public.check_ebook_lead_rate_limit(
  p_ip_address TEXT, 
  p_max_requests INTEGER DEFAULT 5, 
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count INT;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Calculate window start (round to nearest window)
  v_window_start := date_trunc('hour', NOW()) + 
    (EXTRACT(MINUTE FROM NOW())::INT / p_window_minutes) * (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Try to insert or update the rate limit record
  INSERT INTO public.ebook_lead_rate_limits (ip_address, request_count, window_start, updated_at)
  VALUES (p_ip_address, 1, v_window_start, NOW())
  ON CONFLICT (ip_address, window_start)
  DO UPDATE SET 
    request_count = ebook_lead_rate_limits.request_count + 1,
    updated_at = NOW()
  RETURNING request_count INTO v_current_count;
  
  -- Return true if within limit, false if exceeded
  RETURN v_current_count <= p_max_requests;
END;
$$;

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can submit lead" ON public.ebook_leads;

-- No new public policies - all inserts must go through the Edge Function with service role