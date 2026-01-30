-- Security hardening: prevent public enumeration/access to private ebook files
-- 1) Ensure ebooks bucket remains private
update storage.buckets
set public = false
where id = 'ebooks';

-- 2) Remove public read policy on ebook objects metadata (prevents list + signed URL creation by anon)
-- Note: Ebook downloads should happen only via server-generated signed URLs.
drop policy if exists "Ebooks are publicly accessible" on storage.objects;
