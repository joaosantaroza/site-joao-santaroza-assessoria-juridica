
-- Track WhatsApp widget clicks
CREATE TABLE public.whatsapp_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public widget tracking)
CREATE POLICY "Anyone can insert whatsapp clicks"
  ON public.whatsapp_clicks
  FOR INSERT
  WITH CHECK (true);

-- Block anonymous reads
CREATE POLICY "Block anon read whatsapp clicks"
  ON public.whatsapp_clicks
  FOR SELECT
  USING (false);

-- Admins can read
CREATE POLICY "Admins can read whatsapp clicks"
  ON public.whatsapp_clicks
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Block updates/deletes
CREATE POLICY "Block update whatsapp clicks"
  ON public.whatsapp_clicks
  FOR UPDATE
  USING (false);

CREATE POLICY "Block delete whatsapp clicks"
  ON public.whatsapp_clicks
  FOR DELETE
  USING (false);

-- Admins can delete
CREATE POLICY "Admins can delete whatsapp clicks"
  ON public.whatsapp_clicks
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
