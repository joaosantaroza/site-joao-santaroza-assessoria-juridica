-- ============================================
-- FIX: View Count Rate Limiting
-- Prevents automated view count manipulation
-- ============================================

-- Create rate limit table for article views
CREATE TABLE IF NOT EXISTS public.article_view_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  article_slug TEXT NOT NULL,
  last_view_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (ip_address, article_slug)
);

-- Enable RLS on the new table
ALTER TABLE public.article_view_rate_limits ENABLE ROW LEVEL SECURITY;

-- Block all direct client access (deny-by-default)
CREATE POLICY "block_anon_all_article_view_rate_limits"
  ON public.article_view_rate_limits
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "block_auth_all_article_view_rate_limits"
  ON public.article_view_rate_limits
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Revoke all privileges from client roles
REVOKE ALL PRIVILEGES ON TABLE public.article_view_rate_limits FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public.article_view_rate_limits FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.article_view_rate_limits FROM authenticated;

-- Grant access only to service_role for backend operations
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.article_view_rate_limits TO service_role;

-- Update the increment_article_view function to include rate limiting
CREATE OR REPLACE FUNCTION public.increment_article_view(
  p_slug TEXT,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_view TIMESTAMPTZ;
  v_cooldown_minutes INT := 60; -- 1 hour cooldown per IP per article
BEGIN
  -- If IP address provided, check rate limit
  IF p_ip_address IS NOT NULL AND p_ip_address != '' THEN
    -- Check if this IP viewed this article recently
    SELECT last_view_at INTO v_last_view
    FROM article_view_rate_limits
    WHERE ip_address = p_ip_address AND article_slug = p_slug;
    
    IF v_last_view IS NOT NULL AND v_last_view > now() - (v_cooldown_minutes || ' minutes')::INTERVAL THEN
      -- Too soon, skip increment
      RETURN false;
    END IF;
    
    -- Upsert rate limit record
    INSERT INTO article_view_rate_limits (ip_address, article_slug, last_view_at)
    VALUES (p_ip_address, p_slug, now())
    ON CONFLICT (ip_address, article_slug)
    DO UPDATE SET last_view_at = now();
  END IF;
  
  -- Increment view count for published articles only
  UPDATE blog_posts
  SET view_count = view_count + 1
  WHERE slug = p_slug AND published = true;
  
  RETURN true;
END;
$$;

-- Add cleanup function to remove old view rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_article_view_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM article_view_rate_limits
  WHERE last_view_at < now() - INTERVAL '7 days';
END;
$$;

-- ============================================
-- FIX: Blog Posts RLS Policy Clarity
-- Convert to PERMISSIVE for public read access
-- ============================================

-- Drop the existing RESTRICTIVE public read policy
DROP POLICY IF EXISTS "Posts publicados são visíveis para todos" ON public.blog_posts;

-- Create PERMISSIVE policy for public read access (clearer intent)
CREATE POLICY "public_can_read_published_posts"
  ON public.blog_posts
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (
    published = true 
    AND (scheduled_at IS NULL OR scheduled_at <= now())
  );