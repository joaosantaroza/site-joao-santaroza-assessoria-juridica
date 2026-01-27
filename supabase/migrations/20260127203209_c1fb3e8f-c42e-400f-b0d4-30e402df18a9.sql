-- Create table for e-book download leads
CREATE TABLE public.ebook_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  ebook_id TEXT NOT NULL,
  ebook_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ebook_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form)
CREATE POLICY "Anyone can submit lead" 
ON public.ebook_leads 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated admins could read leads (for future admin panel)
CREATE POLICY "Authenticated users can read leads" 
ON public.ebook_leads 
FOR SELECT 
USING (auth.role() = 'authenticated');