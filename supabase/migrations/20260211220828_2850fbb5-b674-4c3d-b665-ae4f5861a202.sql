-- Add pdf_url column to blog_posts for storing the generated PDF link
ALTER TABLE public.blog_posts ADD COLUMN pdf_url text;
