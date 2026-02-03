
# Plano de Otimização SEO e Google Ads

## Resumo Executivo
Este plano visa maximizar a visibilidade orgânica do site e preparar a estrutura para campanhas de Google Ads eficazes. O projeto já possui uma base sólida de SEO (meta tags dinâmicas, JSON-LD, breadcrumbs, sitemap), mas há oportunidades significativas de melhoria.

---

## Fase 1: SEO On-Page Avançado

### 1.1 Schema Markup Expandido (Dados Estruturados)
**Objetivo:** Ativar rich snippets no Google (estrelas, FAQ, autor, etc.)

**Implementações:**
- **FAQPage Schema** na seção de Perguntas Frequentes (já existe o componente FAQSection, mas sem JSON-LD)
- **LegalService Schema** na página inicial (identifica o escritório como serviço jurídico)
- **LocalBusiness Schema** com endereço, telefone, horário de funcionamento
- **Person Schema** para o advogado (expertise, credenciais OAB)
- **HowTo Schema** nos artigos que explicam processos (ex: "Como recuperar IR")
- **WebSite Schema** com SearchAction para habilitar sitelinks search box

### 1.2 Otimização de Imagens
**Objetivo:** Melhorar Core Web Vitals e acessibilidade

**Implementações:**
- Adicionar atributos `loading="lazy"` e `decoding="async"` em todas as imagens
- Implementar componente `OptimizedImage` com fallback para placeholder
- Adicionar `alt` descritivos e contextuais em todas as imagens
- Usar formato WebP quando possível (com fallback)

### 1.3 Heading Structure e Semântica
**Objetivo:** Hierarquia clara para crawlers

**Implementações:**
- Garantir H1 único por página
- Adicionar `<main>`, `<article>`, `<aside>`, `<section>` semânticos
- Implementar links internos estratégicos entre artigos relacionados

---

## Fase 2: SEO Técnico

### 2.1 Core Web Vitals
**Objetivo:** Melhorar LCP, FID e CLS

**Implementações:**
- Preconnect para fontes e CDNs externos no `index.html`
- Font-display: swap para fontes personalizadas
- Otimizar Framer Motion para reduzir CLS (usar layout animations cuidadosamente)
- Critical CSS inline para above-the-fold

### 2.2 Hreflang e Canonicals
**Objetivo:** Evitar conteúdo duplicado

**Implementações:**
- Canonical dinâmico já existe - validar implementação
- Adicionar meta `hreflang="pt-BR"` explícito
- Trailing slash consistency

### 2.3 Atualização Automática do Sitemap
**Objetivo:** Manter sitemap sempre atualizado

**Implementações:**
- Criar painel admin para regenerar sitemap.xml estático
- Ou: configurar cron job para atualizar semanalmente via Edge Function existente

---

## Fase 3: Conteúdo e Keywords

### 3.1 Palavras-chave Estratégicas
**Objetivo:** Ranquear para termos de alta intenção

**Keywords principais identificadas:**
- "isenção imposto de renda doença grave"
- "advogado isenção IR aposentado"
- "restituição imposto de renda HIV"
- "desbloqueio conta judicial"
- "advogado trabalhista [cidade]"

**Implementações:**
- Adicionar seção de texto expandido na HomePage com keywords naturais
- Otimizar títulos H1/H2 dos artigos com variações de keywords
- Meta descriptions com CTAs e keywords (já existe parcialmente)

### 3.2 Cluster de Conteúdo
**Objetivo:** Estabelecer autoridade temática

**Estrutura proposta:**
```text
Pilar: /isencao-de-imposto-de-renda (Hub)
├── /blog/isencao-ir-hiv
├── /blog/molestias-graves-lei
├── /blog/restituicao-retroativa
├── /blog/[novos artigos sobre isenção]
```

**Implementações:**
- Adicionar links internos automáticos entre artigos do mesmo cluster
- Breadcrumbs contextuais por categoria
- Related Articles otimizado por categoria (já existe)

---

## Fase 4: Preparação para Google Ads

### 4.1 Landing Pages Otimizadas
**Objetivo:** Maximizar Quality Score e conversões

**Implementações:**
- Criar landing pages dedicadas para cada serviço principal:
  - `/lp/isencao-imposto-renda` (para campanhas de isenção)
  - `/lp/desbloqueio-contas` (para campanhas de execução)
  - `/lp/advogado-trabalhista` (para campanhas trabalhistas)
- Cada LP terá:
  - Headline alinhada com anúncio
  - CTA proeminente (WhatsApp/Formulário)
  - Prova social (depoimentos/resultados)
  - FAQ específico
  - Formulário de captura simples

### 4.2 Tracking e Conversões
**Objetivo:** Mensurar ROI das campanhas

**Implementações:**
- Adicionar suporte para GTM (Google Tag Manager) no `index.html`
- Criar eventos de conversão:
  - `click_whatsapp` - Clique no botão WhatsApp
  - `form_submit` - Envio de formulário de contato
  - `ebook_download` - Download de e-book
  - `call_click` - Clique no telefone
- Preparar atributos `data-*` para rastreamento

### 4.3 Extensões de Anúncio
**Objetivo:** Aumentar CTR nos anúncios

**Dados estruturados para extensões:**
- Sitelinks (Blog, Áreas de Atuação, Contato)
- Callout (Atendimento Sigiloso, Restituição em até 5 anos)
- Snippets estruturados (Serviços: Isenção IR, Desbloqueio, Trabalhista)
- Localização (Maringá/PR + Atendimento Nacional)

---

## Fase 5: SEO Local

### 5.1 Google Business Profile
**Objetivo:** Aparecer no Map Pack

**Implementações:**
- LocalBusiness Schema completo com:
  - NAP (Name, Address, Phone) consistente
  - Horário de funcionamento
  - Área de atendimento (Maringá + Brasil)
  - Categorias: Advogado, Assessoria Jurídica
- Gerar QR Code para avaliações no Google

### 5.2 Citações Locais
**Objetivo:** Consistência NAP

**Recomendações (fora do código):**
- Cadastrar em diretórios jurídicos (JusBrasil, Escavador)
- Perfil na OAB-PR
- Google Business Profile otimizado

---

## Detalhamento Técnico

### Arquivos Novos a Criar
1. `src/components/seo/FAQSchema.tsx` - JSON-LD para FAQPage
2. `src/components/seo/LocalBusinessSchema.tsx` - JSON-LD para negócio local
3. `src/components/seo/WebsiteSchema.tsx` - JSON-LD com SearchAction
4. `src/components/OptimizedImage.tsx` - Componente de imagem otimizada
5. `src/pages/LandingPage.tsx` - Template para landing pages de Ads
6. `src/components/ConversionTracking.tsx` - Eventos de conversão

### Arquivos a Modificar
1. `index.html` - Preconnects, GTM, hreflang
2. `src/components/FAQSection.tsx` - Injetar FAQPage Schema
3. `src/components/HomePage.tsx` - LocalBusiness Schema
4. `src/hooks/useSEO.tsx` - Expandir com mais meta tags
5. `src/App.tsx` - Adicionar rotas para landing pages
6. `public/robots.txt` - Otimizar diretivas

### Banco de Dados
- Adicionar tabela `conversion_events` para rastrear conversões internamente
- Campos: `id`, `event_type`, `page_url`, `user_agent`, `created_at`, `metadata`

---

## Cronograma Sugerido

| Fase | Prioridade | Impacto SEO | Impacto Ads |
|------|-----------|-------------|-------------|
| 1.1 Schema Markup | Alta | Alto | Médio |
| 2.1 Core Web Vitals | Alta | Alto | Alto |
| 4.1 Landing Pages | Alta | Baixo | Muito Alto |
| 4.2 Tracking | Alta | Baixo | Muito Alto |
| 3.1 Keywords | Média | Alto | Médio |
| 1.2 Otimização Imagens | Média | Médio | Médio |
| 5.1 SEO Local | Média | Alto | Baixo |

---

## Métricas de Sucesso

**SEO Orgânico:**
- Aumento de impressões no Search Console (+50% em 3 meses)
- Cliques orgânicos para keywords principais
- Rich snippets ativos (FAQ, Autor, Breadcrumbs)
- Core Web Vitals no verde

**Google Ads:**
- Quality Score > 7 nas landing pages
- Taxa de conversão > 5% (WhatsApp clicks)
- Custo por conversão otimizado
- Tracking de eventos funcionando

