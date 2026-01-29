-- Add scheduled_at column to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Drop existing policy for published posts
DROP POLICY IF EXISTS "Posts publicados são visíveis para todos" ON public.blog_posts;

-- Create new policy that respects scheduled_at
CREATE POLICY "Posts publicados são visíveis para todos" 
ON public.blog_posts 
FOR SELECT 
USING (
  published = true 
  AND (scheduled_at IS NULL OR scheduled_at <= now())
);