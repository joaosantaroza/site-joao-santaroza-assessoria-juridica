-- Criar tabela para armazenar artigos do blog
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Geral',
  image_url TEXT,
  read_time TEXT NOT NULL DEFAULT '5 min',
  published BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Habilitar RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública de posts publicados
CREATE POLICY "Posts publicados são visíveis para todos"
ON public.blog_posts
FOR SELECT
USING (published = true);

-- Política para admins lerem todos os posts (incluindo rascunhos)
CREATE POLICY "Admins podem ler todos os posts"
ON public.blog_posts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Política para admins criarem posts
CREATE POLICY "Admins podem criar posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Política para admins atualizarem posts
CREATE POLICY "Admins podem atualizar posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Política para admins deletarem posts
CREATE POLICY "Admins podem deletar posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_blog_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_post_updated_at();

-- Índices para performance
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);