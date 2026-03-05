

# Dashboard de SEO no Painel Admin

## Visao geral

Adicionar uma nova aba "SEO" no painel de artigos (`/admin/artigos`) com quatro funcionalidades:

1. **Pontuacao de meta tags por artigo** — analise client-side do titulo, excerpt, slug, imagem e categorias
2. **Artigos sem alt text nas imagens** — scan do conteudo markdown/HTML buscando `<img>` e `![` sem alt
3. **Links quebrados internos** — detectar links internos no conteudo que apontam para slugs inexistentes
4. **Sugestoes de palavras-chave com IA** — usar Lovable AI (Gemini Flash) via edge function para gerar keywords

## Implementacao

### Novo componente: `src/components/admin/SEODashboard.tsx`

Componente principal com 4 secoes em cards:

**1. Score de Meta Tags (client-side)**
Para cada artigo publicado, calcular pontuacao (0-100) baseada em:
- Titulo entre 30-60 caracteres (+25pts)
- Excerpt/description entre 120-160 chars (+25pts)
- Imagem de capa presente (+20pts)
- Categorias definidas (+15pts)
- Slug amigavel sem caracteres especiais (+15pts)

Exibir tabela com artigo, score, e indicadores visuais (verde/amarelo/vermelho).

**2. Artigos sem Alt Text (client-side)**
Scan do campo `content` de cada artigo buscando:
- Tags `<img` sem atributo `alt` ou com `alt=""`
- Sintaxe markdown `![](url)` com alt vazio
Listar artigos afetados com contagem de imagens sem alt e link para edicao.

**3. Links Internos Quebrados (client-side)**
Extrair links internos do conteudo (href que comecam com `/blog/` ou contem o dominio do site), verificar se o slug referenciado existe na lista de artigos publicados. Listar links orfaos.

**4. Sugestoes de Palavras-chave (IA)**
Botao por artigo que chama edge function para gerar 5-8 keywords SEO baseadas no titulo, excerpt e categoria. Usa Lovable AI Gateway com `google/gemini-3-flash-preview`.

### Nova edge function: `supabase/functions/suggest-keywords/index.ts`

Recebe `{ title, excerpt, category }`, chama Lovable AI Gateway com tool calling para retornar array de keywords estruturado. Retorna JSON com sugestoes.

### Integracao no AdminArticles

Adicionar nova aba "SEO" no `TabsList` de `/admin/artigos` ao lado de "Criar & Gerenciar", "Social Media" e "Analytics". A aba renderiza o componente `SEODashboard` recebendo a lista de artigos.

### Arquivos a criar
- `src/components/admin/SEODashboard.tsx`
- `supabase/functions/suggest-keywords/index.ts`

### Arquivos a modificar
- `src/pages/AdminArticles.tsx` — adicionar aba SEO
- `supabase/config.toml` — registrar nova edge function

