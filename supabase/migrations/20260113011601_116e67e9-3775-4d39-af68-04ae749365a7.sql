-- Revoke EXECUTE permission on cleanup_old_rate_limits from anon role
-- This function should only be called by service role (Edge Functions) or via cron job
REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits FROM anon;

-- Grant to service_role only for Edge Function access
GRANT EXECUTE ON FUNCTION public.cleanup_old_rate_limits TO service_role;