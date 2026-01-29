-- Make the ebooks bucket private (only PDFs should be stored here now)
-- Covers are now stored in the public blog-images bucket
UPDATE storage.buckets SET public = false WHERE id = 'ebooks';

-- Update storage policies for the private ebooks bucket
-- Remove the public select policy since bucket is now private
DROP POLICY IF EXISTS "Public read access for ebooks" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read ebooks" ON storage.objects;

-- Ensure admins can still upload and manage files
DROP POLICY IF EXISTS "Admin ebook upload" ON storage.objects;
CREATE POLICY "Admin ebook upload" ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'ebooks' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Admin ebook delete" ON storage.objects;
CREATE POLICY "Admin ebook delete" ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'ebooks' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to read files (needed for generating signed URLs)
DROP POLICY IF EXISTS "Admin ebook select" ON storage.objects;
CREATE POLICY "Admin ebook select" ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'ebooks' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);