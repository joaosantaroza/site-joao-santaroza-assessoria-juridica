
# Plano: Integrar Perplexity AI para Geração de Artigos

## Objetivo
Modificar a edge function `generate-article` para usar a **Perplexity AI** ao invés do Lovable AI Gateway. A Perplexity oferece respostas fundamentadas em buscas web em tempo real, o que resultará em artigos com informações mais atualizadas e citações de fontes reais.

---

## Benefícios da Perplexity

- **Busca em tempo real**: O conteúdo gerado será baseado em informações atuais da web
- **Citações de fontes**: A API retorna URLs de fontes consultadas, permitindo referências reais
- **Especialização jurídica**: Podemos filtrar buscas para sites jurídicos e oficiais

---

## Alterações Técnicas

### 1. Atualizar Edge Function `generate-article`

**Arquivo:** `supabase/functions/generate-article/index.ts`

**Mudanças:**
- Trocar endpoint de `ai.gateway.lovable.dev` para `api.perplexity.ai/chat/completions`
- Usar modelo `sonar-pro` (ideal para conteúdo complexo com múltiplas citações)
- Adicionar filtro de domínios para priorizar fontes jurídicas confiáveis
- Processar as citações retornadas pela API
- Atualizar autenticação para usar `PERPLEXITY_API_KEY`

### 2. Estrutura da Requisição

```text
┌─────────────────────────────────────────────────────────┐
│                    Edge Function                         │
├─────────────────────────────────────────────────────────┤
│  1. Validar autenticação admin                          │
│  2. Chamar Perplexity API com:                          │
│     - Modelo: sonar-pro                                 │
│     - Prompt especializado em Direito                   │
│     - Filtro de domínios jurídicos (opcional)           │
│  3. Processar resposta + citações                       │
│  4. Formatar HTML do artigo                             │
│  5. Retornar conteúdo + fontes consultadas              │
└─────────────────────────────────────────────────────────┘
```

### 3. Resposta Aprimorada

A resposta incluirá:
- `content`: HTML formatado do artigo
- `excerpt`: Resumo curto
- `category`: Categoria sugerida
- `readTime`: Tempo de leitura calculado
- `sources`: Lista de URLs das fontes consultadas pela Perplexity

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/generate-article/index.ts` | Atualizar para usar Perplexity API |

---

## Configuração de Segurança

- A `PERPLEXITY_API_KEY` já está disponível como secret no projeto
- CORS e verificação de admin continuam iguais
- Tratamento de erros (rate limit, pagamento) será adaptado para a Perplexity
