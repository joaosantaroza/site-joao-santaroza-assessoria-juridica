-- Drop existing restrictive policy for public reading
DROP POLICY IF EXISTS "public_can_read_published_posts" ON blog_posts;

-- Create a PERMISSIVE policy for public reading (anon and authenticated without admin role)
-- This allows reading only published posts that are either not scheduled or past their scheduled time
CREATE POLICY "public_can_read_published_posts" 
ON blog_posts 
FOR SELECT 
TO anon, authenticated
USING (
  published = true 
  AND (scheduled_at IS NULL OR scheduled_at <= now())
);