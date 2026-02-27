
# Dashboard de Funil de Conversao

## Objetivo
Adicionar um card visual de funil de conversao na aba "Leads" do Admin, mostrando a jornada: **Visitas** (total de views nos artigos) → **Downloads de E-book** (leads capturados) → **Contato WhatsApp** (cliques no widget), com taxas de conversao entre cada etapa.

## Novo componente: `src/components/admin/ConversionFunnel.tsx`

### Dados recebidos via props
- `totalViews`: numero total de visualizacoes de artigos (soma de `view_count` de `blog_posts`)
- `totalLeads`: quantidade de leads de e-book
- `totalWhatsapp`: quantidade de cliques WhatsApp

### Visual
- 3 barras horizontais empilhadas (funil), cada uma mais estreita que a anterior
- Cada barra mostra: icone + label + valor absoluto
- Entre cada barra, uma seta com a taxa de conversao (ex: "12.5%")
- Cores: accent para visitas, primary para downloads, verde (#25D366) para WhatsApp
- Animacao de entrada com framer-motion (barras deslizam da esquerda, sequencialmente)
- Layout responsivo (stack vertical funciona em mobile)

### Logica de taxas
- Taxa Visita→Download: `(totalLeads / totalViews) * 100`
- Taxa Download→WhatsApp: `(totalWhatsapp / totalLeads) * 100`
- Taxa geral (Visita→WhatsApp): `(totalWhatsapp / totalViews) * 100`
- Protecao contra divisao por zero

## Alteracoes em `src/pages/Admin.tsx`

### Buscar dados de views
- Adicionar estado `totalArticleViews`
- Criar funcao `fetchArticleViews` que faz `supabase.from('blog_posts').select('view_count')` e soma todos os valores
- Chamar no `useEffect` junto com `fetchLeads` e `fetchWhatsappClicks`

### Inserir o funil
- Importar `ConversionFunnel`
- Inserir um Card logo acima dos stats cards existentes (antes da grid de 4 cards)
- Titulo: "Funil de Conversao"
- Descricao: "Jornada do visitante: visualizacao → download → contato"
- Passar `totalViews`, `leads.length`, `whatsappClicks.length` como props

## Detalhes tecnicos

- As barras do funil usam largura proporcional: a maior etapa ocupa 100%, as demais proporcionalmente
- Cada barra tera `border-radius` e padding interno
- Taxa de conversao exibida em badge entre as barras com icone de seta para baixo
- Tooltip opcional ao hover mostrando o calculo
- Caso algum valor seja 0, exibe "N/A" na taxa
