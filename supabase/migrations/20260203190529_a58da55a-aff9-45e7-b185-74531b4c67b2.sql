-- Add admin-only SELECT policy for article_view_rate_limits monitoring
CREATE POLICY "Admins can read article view rate limits"
ON public.article_view_rate_limits
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));