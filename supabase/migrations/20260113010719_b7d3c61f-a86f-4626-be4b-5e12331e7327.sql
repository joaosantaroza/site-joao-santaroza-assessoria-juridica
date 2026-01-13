-- Create table for persistent TTS rate limiting
CREATE TABLE public.tts_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  request_count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_ip_window UNIQUE (ip_address, window_start)
);

-- Create index for efficient lookups
CREATE INDEX idx_tts_rate_limits_ip ON public.tts_rate_limits (ip_address);
CREATE INDEX idx_tts_rate_limits_window ON public.tts_rate_limits (window_start);

-- Enable RLS
ALTER TABLE public.tts_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow edge functions (service role) to access this table
-- No public access policies - table is only accessed via service role from edge functions

-- Create function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_tts_rate_limit(
  p_ip_address TEXT,
  p_max_requests INT DEFAULT 10,
  p_window_minutes INT DEFAULT 60
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
  INSERT INTO public.tts_rate_limits (ip_address, request_count, window_start, updated_at)
  VALUES (p_ip_address, 1, v_window_start, NOW())
  ON CONFLICT (ip_address, window_start)
  DO UPDATE SET 
    request_count = tts_rate_limits.request_count + 1,
    updated_at = NOW()
  RETURNING request_count INTO v_current_count;
  
  -- Return true if within limit, false if exceeded
  RETURN v_current_count <= p_max_requests;
END;
$$;

-- Create cleanup function for old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.tts_rate_limits 
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$;

-- Grant execute permission on functions to anon role (for edge function access)
GRANT EXECUTE ON FUNCTION public.check_tts_rate_limit TO anon;
GRANT EXECUTE ON FUNCTION public.cleanup_old_rate_limits TO anon;