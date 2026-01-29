-- Alterar coluna category de text para text[] (array)
-- Primeiro, converter os dados existentes

-- Criar nova coluna temporária
ALTER TABLE public.blog_posts ADD COLUMN categories text[] DEFAULT ARRAY['Geral']::text[];

-- Migrar dados existentes: converter o valor text para array com um elemento
UPDATE public.blog_posts 
SET categories = ARRAY[category]::text[]
WHERE category IS NOT NULL AND category != '';

-- Remover a coluna antiga
ALTER TABLE public.blog_posts DROP COLUMN category;

-- Renomear a nova coluna para category
ALTER TABLE public.blog_posts RENAME COLUMN categories TO category;

-- Atualizar o default
ALTER TABLE public.blog_posts ALTER COLUMN category SET DEFAULT ARRAY['Geral']::text[];