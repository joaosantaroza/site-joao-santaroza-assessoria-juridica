-- Create table to track trending topic analytics
CREATE TABLE public.trending_topic_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_title TEXT NOT NULL,
  category TEXT NOT NULL,
  interest_level TEXT,
  source_domains TEXT[],
  approved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_by UUID REFERENCES auth.users(id),
  article_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trending_topic_analytics ENABLE ROW LEVEL SECURITY;

-- Only admins can read analytics
CREATE POLICY "Admins can read trending analytics"
ON public.trending_topic_analytics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert analytics
CREATE POLICY "Admins can insert trending analytics"
ON public.trending_topic_analytics
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update analytics
CREATE POLICY "Admins can update trending analytics"
ON public.trending_topic_analytics
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete analytics
CREATE POLICY "Admins can delete trending analytics"
ON public.trending_topic_analytics
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_trending_analytics_category ON public.trending_topic_analytics(category);
CREATE INDEX idx_trending_analytics_approved_at ON public.trending_topic_analytics(approved_at DESC);