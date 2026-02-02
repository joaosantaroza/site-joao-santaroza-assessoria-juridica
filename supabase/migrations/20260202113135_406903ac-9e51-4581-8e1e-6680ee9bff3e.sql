-- Add PERMISSIVE policy allowing admins to read tts_rate_limits for security monitoring
CREATE POLICY "Admins can read tts rate limits"
ON public.tts_rate_limits
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));