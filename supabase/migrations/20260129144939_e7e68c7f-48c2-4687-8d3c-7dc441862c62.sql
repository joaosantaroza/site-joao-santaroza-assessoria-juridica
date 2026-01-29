-- Add eBook fields to blog_posts table
ALTER TABLE public.blog_posts
ADD COLUMN has_ebook boolean NOT NULL DEFAULT false,
ADD COLUMN ebook_title text,
ADD COLUMN ebook_subtitle text,
ADD COLUMN ebook_pdf_url text,
ADD COLUMN ebook_cover_url text;

-- Add comment for documentation
COMMENT ON COLUMN public.blog_posts.has_ebook IS 'Whether this article has an eBook offer';
COMMENT ON COLUMN public.blog_posts.ebook_title IS 'Title of the eBook';
COMMENT ON COLUMN public.blog_posts.ebook_subtitle IS 'Call-to-action subtitle for the eBook';
COMMENT ON COLUMN public.blog_posts.ebook_pdf_url IS 'URL of the eBook PDF file in storage';
COMMENT ON COLUMN public.blog_posts.ebook_cover_url IS 'URL of the eBook cover image in storage';

-- Create storage bucket for ebooks if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebooks', 'ebooks', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ebooks bucket
CREATE POLICY "Ebooks are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'ebooks');

CREATE POLICY "Admins can upload ebooks" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ebooks' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update ebooks" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'ebooks' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete ebooks" ON storage.objects
FOR DELETE USING (
  bucket_id = 'ebooks' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Add email field to ebook_leads table
ALTER TABLE public.ebook_leads
ADD COLUMN email text;