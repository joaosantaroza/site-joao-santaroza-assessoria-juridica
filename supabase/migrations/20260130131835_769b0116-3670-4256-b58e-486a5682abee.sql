-- Add view_count column to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN view_count integer NOT NULL DEFAULT 0;

-- Create function to increment view count (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.increment_article_view(p_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE blog_posts
  SET view_count = view_count + 1
  WHERE slug = p_slug AND published = true;
END;
$$;